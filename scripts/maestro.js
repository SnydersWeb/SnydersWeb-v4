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

        this.pageFetcher = new PageFetcher();

        //Get information about where we're starting
        this.currentPageInfo = this.pageFetcher.extractPageInfo(document);
        this.requestedPageInfo = {};
    }

    //Methods
    init() {
        this.mainContainer.addEventListener('fetchPage', (evt) => { this.fetchPage(evt) });        
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
    /*
    function FixLink(hyperLink) {
        try {
            //alert(window.location.host + "\nhref:" + hyperLink.getAttribute("href") + "\nhttp:" + hyperLink.getAttribute("href").search(/http/i) + "\nJS:" + hyperLink.getAttribute("href").search(/JavaScript\:/i) + "\nJPG:" + hyperLink.getAttribute("href").search(/\.jpg/i) + "\nGIF:" + hyperLink.getAttribute("href").search(/\.gif/i));
            if(hyperLink.getAttribute("href").search(/http/i) < 0 && hyperLink.getAttribute("href").search(/JavaScript\:/i) < 0 && hyperLink.getAttribute("href").search(/\.jpg/i) < 0 && hyperLink.getAttribute("href").search(/\.mpg/i) < 0 && hyperLink.getAttribute("href").search(/\.gif/i) < 0 && hyperLink.getAttribute("href").search(/mailto/i) < 0) {
                if(dirContext != startDirContext) {
                    hyperLink.setAttribute("href","JavaScript:FetchContent('" + dirContext + hyperLink.getAttribute("href") + "')");
                } else {
                    hyperLink.setAttribute("href","JavaScript:FetchContent('" + hyperLink.getAttribute("href") + "')");
                }
            } else if(hyperLink.getAttribute("href").search(/\.jpg/i) > -1 || hyperLink.getAttribute("href").search(/\.gif/i) > -1 || hyperLink.getAttribute("href").search(/\.mpg/i) > -1) {
                if(dirContext != startDirContext) {
                    hyperLink.setAttribute("href", "JavaScript:ShowShot('" + dirContext + hyperLink.getAttribute("href") + "', 'screen_shot', true, 'auto', 'auto')");
                } else {
                    hyperLink.setAttribute("href", "JavaScript:ShowShot('" + hyperLink.getAttribute("href") + "', 'screen_shot', true, 'auto', 'auto')");
                }
            } else if(hyperLink.getAttribute("href").search(window.location.host) > 0 && hyperLink.getAttribute("href").search(/w3\.org/i) == -1) {
                //Quick hack because IE likes reading more into a hyperlink than what's actually there - only happens on home... GRUMBLE!
                hyperLink.setAttribute("href","JavaScript:FetchContent('" + hyperLink.getAttribute("href") + "')");
            } else if(hyperLink.getAttribute("href").search(/http/i) > -1) {
                hyperLink.setAttribute("target", "_blank");
            }
        } catch(e) {
            //alert(e + "\n" + e.description);
        }
    
        return hyperLink;
    }
    */
    swapContent(content) {
        //content comes in with "raw" links that doesn't play nicely with the fetch system.. So let's convert them
        let fixedContent = content.innerHTML;
        let contentLinks = content.querySelectorAll("A");
        contentLinks.forEach((link) => {
            if (/http:/i.test(link.href) === false) { //NOT Link to external
                let newLink = link.cloneNode(true);
                const newHref = `() => {this.fetchPage({detail:{ pageURL:${link.href} }})}`;
                newLink.removeAttribute('href');
                newLink.setAttribute("onclick", newHref)
                console.log(`link:${link.outerHTML} rep:${newLink.outerHTML}`);
                let testMe = fixedContent.indexOf(link.outerHTML);
                fixedContent.replace(link.outerHTML, newLink.outerHTML);
            }
        });



        const fadeOut = this.pageContent.animate([
            {
                opacity: 1,
            },
            {
                opacity: 0,
            },
        ], {
            duration: 250,
            easing: "ease-in-out",
        });
        fadeOut.addEventListener("finish", () => { 
            this.pageContent.innerHTML = fixedContent;

            const fadeIn = this.pageContent.animate([
                {
                    opacity: 0,
                },
                {
                    opacity: 1,
                },
            ], {
                duration: 250,
                easing: "ease-in-out",
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
                let subTopicDOM = null;
                //again classic loop to break out of it.
                for (let i = 0, j = domSubTopics.length; i < j; i += 1) {
                    if (domSubTopics[i].dataset.id === reqSubTopic.id) {
                        subTopicDOM = domSubTopics[i];
                        break;
                    }
                }
                subTopicDOM.setAttribute("selected", reqSubTopic.selected);
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