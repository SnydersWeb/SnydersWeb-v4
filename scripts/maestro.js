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

        //Convert hyperlinks in page body
        const { pathname } = window.location;
        this.subDirectoryRegEx = /aboutme|websites|portfolio|destinations|contact/gi;
        this.isInRoot = this.subDirectoryRegEx.test(pathname) === false;        
        const rawPath = pathname.replace(/\\/gi,"/").substring(0, pathname.replace(/\\/gi,"/").lastIndexOf("/"));
        const rawPathParts = rawPath.split('/');
        this.startingDirectory = `${rawPathParts[rawPathParts.length - 1]}/`;
        this.currentDirectory = `${this.startingDirectory}`;
        this.fixLinks();
    }

    //Methods
    init() {
        this.mainContainer.addEventListener('fetchPage', (evt) => { this.fetchPage(evt) });   
        this.mainContainer.addEventListener('showShot', (evt) => { this.showShot(evt) });       
    }

    async fetchPage(fetchInfo) {
        const { pageURL } = fetchInfo.detail;
        
        //SnyderD - Temp code for testing
        // window.location.href = pageURL;
        
        if (pageURL === this.currentPageInfo.headerInfo.href) {
            return; //nothing to do.
        }

        //update our currentDirectory
        const pathParts = pageURL.split("/");
        const isSdIdx = (el) => { 
            return el === this.startingDirectory.replace('/', '');
        };
        const partIdx = pathParts.findIndex(isSdIdx);            
        if (partIdx > 0) {
            const currDir = pathParts[partIdx + 1];
            if (currDir !== this.startingDirectory) {
                this.currentDirectory = currDir;
            }
        }
        
        this.requestedPageInfo = await this.pageFetcher.getPage(pageURL);
        window.location.hash = pageURL;
        
        this.handlePageChanges();        
    }
    
    showShot(fetchInfo) {
        const { detail } = fetchInfo;
        let { resize } = detail;
        let { width } = detail;
        let { height } = detail;
        
        if (/true/i.test(resize)) {
            resize = "resizable,";
        } else {
            resize = "";
        }
        if (width === "auto") {
            width = window.innerWidth/2;
        }
        if (height === "auto") {
            height = window.innerHeight/2;
        }
        window.open(detail.pageURL, detail.name, "scrollbars=yes,menubar=no," + resize + "width=" + width + ",height=" + height);
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
        
    fixLinks() {
        const contentLinks = this.pageContent.querySelectorAll("A");
        const imgRegEx = new RegExp(/\.gif|\.jpg|\.png|\.svg/i);
        contentLinks.forEach((link) => {
            const { href } = link;
            if (/http:/i.test(href) === false && imgRegEx.test(href) === false) { //NOT Link to external
                let linkHref = href;
                const fileName = href.substring(href.lastIndexOf("/"), href.length);
                const rawPath = href.replace(/\\/gi,"/").substring(0, href.replace(/\\/gi,"/").lastIndexOf("/"));
                const rawPathParts = rawPath.split('/');
                const linkDirCtx = `${rawPathParts[rawPathParts.length - 1]}/`;
                const dirMatches = href.match(this.subDirectoryRegEx);
                
                if (this.isInRoot === false) { //When going from child to home the pathing gets a tad janked
                    if (linkDirCtx !== this.startingDirectory || (dirMatches !== null && dirMatches.length > 1)) {
                        linkHref = href.replace(this.startingDirectory, "");
                    }                    
                } else {
                    if (href.search(this.startingDirectory) < 0) {
                        rawPathParts.push(this.startingDirectory);
                        rawPathParts.push(fileName);
                        linkHref = rawPathParts.join('/');
                    } else if (href.search(this.currentDirectory) < 0) {
                        rawPathParts.push(this.currentDirectory);
                        rawPathParts.push(fileName);
                        linkHref = rawPathParts.join('/');
                        console.log(this.currentDirectory);
                    } 
                }
                const linkClickEvent = new CustomEvent(
                    "fetchPage", 
                    {
                        detail: {
                            pageURL: linkHref
                        }, 
                        bubbles: false,
                        cancelable: true,
                    }
                );
                
                link.setAttribute('href', "JavaScript:void(0);");
                link.dataset.link = linkHref;
                link.addEventListener('click', () => { this.mainContainer.dispatchEvent(linkClickEvent); });
            } else if (imgRegEx.test(href)) { //special image link
                const linkClickEvent = new CustomEvent(
                    "showShot", 
                    {
                        detail: {
                            pageURL: href,
                            name: 'screen_shot',
                            resize: true,
                            width: 'auto',
                            height: 'auto',
                        }, 
                        bubbles: false,
                        cancelable: true,
                    }
                );

                link.setAttribute('href', "JavaScript:void(0);");
                link.addEventListener('click', () => { this.mainContainer.dispatchEvent(linkClickEvent); });
            }
        });
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
            duration: 500,
            easing: "ease-out",
        });
        fadeOut.addEventListener("finish", () => { 
            this.pageContent.innerHTML = content.innerHTML;
            this.fixLinks();

            const fadeIn = this.pageContent.animate([
                {
                    opacity: 0,
                },
                {
                    opacity: 1,
                },
            ], {
                duration: 500,
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
                let subTopicDOM = null;
                //again classic loop to break out of it.
                for (let i = 0, j = domSubTopics.length; i < j; i += 1) {
                    if (domSubTopics[i].dataset.id === reqSubTopic.id) {
                        subTopicDOM = domSubTopics[i];
                        break;
                    }
                }
                if (subTopicDOM !== null) {
                    subTopicDOM.setAttribute("selected", reqSubTopic.selected);
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