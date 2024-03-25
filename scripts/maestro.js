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
        this.mainContainer.addEventListener('fetchPage', (evt) => { this.fetchPage(evt) });   
        this.mainContainer.addEventListener('showShot', (evt) => { this.utils.showShot(evt) });       
    }

    async fetchPage(fetchInfo) {
        const { pageURL } = fetchInfo.detail;
        
        //SnyderD - Temp code for testing
        // window.location.href = pageURL;
        
        if (pageURL === this.currentPageInfo.headerInfo.href) {
            return; //nothing to do.
        }

        this.requestedPageInfo = await this.pageFetcher.getPage(pageURL);
        window.location.hash = pageURL;
        
        this.handlePageChanges();        
    }
    
    collectBarChanges(currHeaderInfo, reqHeaderInfo) {
        let pageChanged = false;
        let barChange = null;
        let selSubTopicsChange = [];
        let subTopicListChange = [];

        if (currHeaderInfo.id !== reqHeaderInfo.id) { //Bar change == everything change
            pageChanged = true;
            barChange = reqHeaderInfo.id;
            selSubTopicsChange = reqHeaderInfo.selectedSubTopicInfo;
            subTopicListChange = reqHeaderInfo.subTopics;
        } else { //Bars are the same - check sub items
            //First start with our selectedSubTopicInfo
            const { selectedSubTopicInfo:curSelectedSubTopicInfo } = currHeaderInfo;
            const { selectedSubTopicInfo:reqSelectedSubTopicInfo } = reqHeaderInfo;
            if (curSelectedSubTopicInfo.length !== reqSelectedSubTopicInfo.length) {
                //Length change doesn't require a deeper check
                pageChanged = true;
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
                    
                    //.forEach is fun - but you can't break out of those
                    for (let i = 0, j = curSubTopicInfo.length; i < j; i += 1) {
                        const subTopic = curSubTopicInfo[i];
                        const reqSubTopic = reqSubTopicInfo[i];
                        if (subTopic.id !== reqSubTopic.id) {
                            pageChanged = true;
                            subTopicListChange = reqSubTopicInfo;
                            break;
                        } else { //Keep going but check to see if we had an individual subTopic item change
                            if (subTopic.selected !== reqSubTopic.selected) {
                                pageChanged = true;
                                subTopicListChange.push(reqSubTopic);
                            }
                        }
                    }
                }
                
            }
        }

        return {
            pageChanged,
            barChange,
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

        //Start with our smallest change - subTopic item only changes
        if (barChanges.barChange === null && barChanges.selSubTopicsChange.length === 0) {
            barChanges.subTopicListChange.forEach((reqSubTopic) => {
                //grab our subTopic DOM item.
                const subTopicDOM = [...domSubTopics].filter(top => top.dataset.id === reqSubTopic.id);
                if (subTopicDOM !== null && subTopicDOM.length > 0) {
                    subTopicDOM[0].setAttribute("selected", reqSubTopic.selected);
                }
            });
        }

        //Unconditional stuff (content change)
        this.swapContent(this.requestedPageInfo.content);
    }

    finishPageChanges() {
        //update our page info
        this.currentPageInfo = {...this.requestedPageInfo};
        this.requestedPageInfo = {};
    }
}

const pageMaestro = new Maestro();
pageMaestro.init();