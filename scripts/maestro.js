class Maestro {
    constructor() {
        //Not doing anything with the background stuff for now
        this.backgroundBackLayer = document.querySelector("#backgroundBackLayer");
        this.backgroundFrontLayer = document.querySelector("#backgroundFrontLayer");

        //Set up bindings to important areas of the page
        this.mainContainer = document.querySelector("#mainContainer");
        this.logo = this.mainContainer.querySelector("#logo");
        this.pageHeader = this.mainContainer.querySelector("#selectedBar");
        this.unselectedBarArea = this.mainContainer.querySelector("#unSelectedBarArea");
        this.contentPanel = this.mainContainer.querySelector("#contentPanel");
        this.pageContent = this.mainContainer.querySelector("#content");

        this.pageFetcher = pageFetcher;
        this.utils = utils;

        //Get information about where we're starting
        this.currentPageInfo = this.pageFetcher.extractPageInfo(document);
        this.requestedPageInfo = {};

        
        //Convert hyperlinks in page body
        const { pathname } = window.location;
        const rawPath = pathname.replace(/\\/gi,"/").substring(0, pathname.replace(/\\/gi,"/").lastIndexOf("/") + 1);
        this.currentDirectory = this.pageContent.dataset.dir;
        this.startingDirectory = rawPath.replace(this.currentDirectory, "");
            
        this.utils.adjustLinks(this.pageContent, this.mainContainer, this.startingDirectory, this.currentDirectory);
    }

    //Methods
    init() {
        //Selected Topic Bar events
        this.pageHeader.addEventListener('removeSubTopic', (evt) => { this.removeSubTopic(evt) });   

        //Content Panel events
        this.mainContainer.addEventListener('fetchPage', (evt) => { this.fetchPage(evt) });   
        this.mainContainer.addEventListener('showShot', (evt) => { this.utils.showShot(evt) });
    }

    async fetchPage(fetchInfo) {
        const { pageURL } = fetchInfo.detail;
        
        //SnyderD - Temp code for testing
        // window.location.href = pageURL;
        
        //SnyderD - TODO come back to this and get better detection.
        if (false) { //pageURL === this.currentPageInfo.headerInfo.href) {
            return; //nothing to do.
        }

        this.requestedPageInfo = await this.pageFetcher.getPage(pageURL);
        window.location.hash = pageURL;
        
        this.handlePageChanges();        
    }
    
    collectBarChanges(currHeaderInfo, reqHeaderInfo) {
        let pageChanged = false;
        let barChange = null;
        let subTopicChange = null;
        let selSubTopicsChange = [];
        let subTopicListChange = [];

        if (currHeaderInfo.id !== reqHeaderInfo.id) { //Bar change == everything change
            pageChanged = true;
            barChange = reqHeaderInfo.id;
            selSubTopicsChange = reqHeaderInfo.selectedSubTopicInfo;
            subTopicListChange = reqHeaderInfo.subTopics;
        } else { //Bars are the same - check sub items
            //First start with our selectedSubTopicInfo
            const { selectedSubTopicId:curSelectedSubTopicId } = currHeaderInfo;
            const { selectedSubTopicId:reqSelectedSubTopicId } = reqHeaderInfo;
            const { selectedSubTopicInfo:curSelectedSubTopicInfo } = currHeaderInfo;
            const { selectedSubTopicInfo:reqSelectedSubTopicInfo } = reqHeaderInfo;

            //SnyderD - calling it for the night
            //think the correct approach here is to go through requested and current and if they differ, flag with
            //an "add" or "remove" flag - this will let us remove some of the flags.
            

            if (curSelectedSubTopicId !== reqSelectedSubTopicId) {
                //Length change doesn't require a deeper check
                pageChanged = true;
                subTopicChange = reqSelectedSubTopicId;
                selSubTopicsChange = reqHeaderInfo.selectedSubTopicInfo;
                subTopicListChange = reqHeaderInfo.subTopics;
            } else {
                //.forEach is fun - but you can't break out of those
                for (let i = 0, j = curSelectedSubTopicInfo.length; i < j; i += 1) {
                    const topic = curSelectedSubTopicInfo[i];
                    const reqTopic = reqSelectedSubTopicInfo[i];
                    if (topic.id !== reqTopic.id) {
                        pageChanged = true;
                        selSubTopicsChange = reqHeaderInfo.selectedSubTopicInfo;
                        subTopicListChange = reqHeaderInfo.subTopics;
                        break;
                    }
                }
                //OK.. last check - did our subMenu Items change?
                if (!pageChanged) {
                    const { subTopics:curSubTopicInfo } = currHeaderInfo;
                    const { subTopics:reqSubTopicInfo } = reqHeaderInfo;
                    
                    //SnyderD - this replaces that lower block.. but...
                    curSubTopicInfo.forEach((subTopic, iter) => {
                        const reqSubTopic = reqSubTopicInfo[iter];
                        if (subTopic.id !== reqSubTopic.id) {
                            pageChanged = true;
                            subTopicListChange = reqSubTopicInfo;
                        } else if (subTopic.selected !== reqSubTopic.selected) {
                            pageChanged = true;
                            subTopicListChange.push(reqSubTopic);
                        }
                    });

                }
                
            }
        }

        return {
            pageChanged,
            barChange,
            subTopicChange,
            selSubTopicsChange,
            subTopicListChange,
        };
    }
        
    swapContent(content) {      
        const fadeOut = this.pageContent.animate([
            {
                opacity: 1,
            },
            {
                opacity: 0,
            },
        ], {
            duration: 250,
            easing: "ease-out",
        });
        fadeOut.addEventListener("finish", () => { 
            this.pageContent.innerHTML = content.innerHTML;
            this.currentDirectory = content.dataset.dir;
            this.utils.adjustLinks(this.pageContent, this.mainContainer, this.startingDirectory, this.currentDirectory);
            this.utils.adjustImages(this.pageContent, this.startingDirectory, this.currentDirectory);

            const fadeIn = this.pageContent.animate([
                {
                    opacity: 0,
                },
                {
                    opacity: 1,
                },
            ], {
                duration: 250,
                easing: "ease-in",
            });

            fadeIn.addEventListener("finish", () => { 
                this.finishPageChanges();
            });
            
        })
    }

    handlePageChanges() {
        const { headerInfo:currHeaderInfo } = this.currentPageInfo;
        const { headerInfo:reqHeaderInfo } = this.requestedPageInfo;
        
        const barChanges = this.collectBarChanges(currHeaderInfo, reqHeaderInfo);
        console.dir(barChanges);

        if (!barChanges.pageChanged) { //No page change - do nothing.
            return; 
        }

        //make some DOM pointers
        const domSelHeader = this.pageHeader.querySelector("TOPIC-BAR");
        const domSelectedSubTopicArea = domSelHeader.querySelector("DIV.selSubTopics");
        const domSelectedSubTopics = domSelectedSubTopicArea.querySelectorAll("SUB-TOPIC");
        const domHeaderSubNavArea = domSelHeader.querySelector("MENU.headerSubNav");
        const domSubTopics = domHeaderSubNavArea.querySelectorAll("SUB-TOPIC");

        if (barChanges.barChange === null) {
            //Start with our smallest change - subTopic item only changes
            if (barChanges.selSubTopicsChange.length === 0) {
                console.log(`Sub Topic Change!`);
                barChanges.subTopicListChange.forEach((reqSubTopic) => {
                    //grab our subTopic DOM item.
                    const subTopicDOM = [...domSubTopics].filter(top => top.dataset.id === reqSubTopic.id);
                    if (subTopicDOM !== null && subTopicDOM.length > 0) {
                        subTopicDOM[0].setAttribute("selected", reqSubTopic.selected);
                    }
                });
            } else if (barChanges.subTopicChange !== null || (barChanges.subTopicChange === '' && barChanges.selSubTopicsChange.length === 0)) { //We changed our selected sub topic (going up a menu)
                console.log(`Selected Sub Topic Change!`);
                [...domSelectedSubTopics].reverse().forEach((item) => { //reverse it and get rid of anything after our
                    if (item.dataset.id !== barChanges.subTopicChange) {
                        item.setAttribute("dismissed", "true");
                    }
                });

                //Next up.. populate our new sub items.
            }
        }

        //Unconditional stuff (content change)
        this.swapContent(this.requestedPageInfo.content);
    }

    finishPageChanges() {
        //update our page info
        console.log(`setting this.currentPageInfo`);
        this.currentPageInfo = {...this.requestedPageInfo};
        this.requestedPageInfo = {};
    }

    //Event handlers for our Custom Elements
    removeSubTopic(evtInfo) {
        const { item } = evtInfo.detail;
        const { parentNode:pn } = item; //get our parent

        if (/li/i.test(pn.tagName)) {
            const { parentNode:menu } = pn;
            menu.removeChild(pn); 
        } else if (pn.classList.contains("selSubTopics")) {
            pn.removeChild(item); 
        }
    }
}

const pageMaestro = new Maestro();
pageMaestro.init();