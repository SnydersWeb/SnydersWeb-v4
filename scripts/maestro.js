class Maestro {
    constructor() {
        //Grab our utils
        this.pageFetcher = pageFetcher;
        this.utils = utils;

        //Not doing anything with the background stuff for now
        this.backgroundBackLayer = document.querySelector("#backgroundBackLayer");
        this.backgroundFrontLayer = document.querySelector("#backgroundFrontLayer");

        //Set up bindings to important areas of the page
        this.mainContainer = document.querySelector("#mainContainer");
        this.mainContainerInfo = this.mainContainer.getBoundingClientRect();
        this.logo = this.mainContainer.querySelector("#logo");
        this.pageHeader = this.mainContainer.querySelector("#selectedBar");
        this.unselectedBarArea = this.mainContainer.querySelector("#unSelectedBarArea");
        this.contentPanel = this.mainContainer.querySelector("#contentPanel");
        this.pageContent = this.mainContainer.querySelector("#content");
        const printBanner = document.querySelector("#printBanner");
        this.printTitle = printBanner.querySelector("DIV.printTitle");
        
        //Get information about where we're starting
        this.currentPageInfo = this.pageFetcher.extractPageInfo(document);
        this.requestedPageInfo = {};
        
        //Convert hyperlinks in page body
        const { pathname, href } = window.location;
        const rawPath = pathname.replace(/\\/gi,"/").substring(0, pathname.replace(/\\/gi,"/").lastIndexOf("/") + 1);
        const fileName = href.substring(href.lastIndexOf("/") + 1, href.length);
        this.currentDirectory = `${this.pageContent.dataset.dir}`;
        this.currPageURL = `${this.currentDirectory}${fileName}`;
        this.reqPageURL = "";
        this.startingDirectory = rawPath.replace(this.currentDirectory, "");
        this.initialized = false;
        this.loader = null;
        this.barsInMotion = 0;
            
        this.utils.adjustLinks(this.pageContent, this.mainContainer, this.startingDirectory, this.currentDirectory);
    }

    //Methods
    init() {
        //Selected Topic Bar events
        this.pageHeader.addEventListener('removeSubTopic', (evt) => { this.removeSubTopic(evt) });   

        //Content Panel events
        this.mainContainer.addEventListener('fetchPage', (evt) => { this.fetchPage(evt) });   
        this.mainContainer.addEventListener('showShot', (evt) => { this.utils.showShot(evt) });
        this.mainContainer.addEventListener('fetchStart', () => { this.showLoader() });
        this.mainContainer.addEventListener('fetchEnd', () => { this.hideLoader() });
        this.mainContainer.addEventListener('barMotionEnd', () => { this.barMotionEnd() });
        window.addEventListener("popstate", () => { this.hashChange() });

        const { hash } = window.location;
        let cleanHash = hash.replace("#", "");
        if (this.initialized === false && cleanHash === "") { // no hash means a fresh hit
            this.mainContainer.addEventListener('finalizeBoot', (evt) => { this.finalizeBoot(evt) });   
            const itemHandles = {
                backgroundBackLayer: this.backgroundBackLayer,
                backgroundFrontLayer: this.backgroundFrontLayer,
                mainContainer: this.mainContainer,
                logo: this.logo,
                pageHeader: this.pageHeader,
                unselectedBarArea: this.unselectedBarArea,
                contentPanel: this.contentPanel,
            };

            //Adding a temporary "cover" to hide everything
            bootSequence.setHandles(itemHandles);
            bootSequence.start();      
        } else {
            bootSequence.sparky();
            this.fetchPage({ detail: { pageURL: cleanHash } });
        }       
        
        if (this.utils.getIsMobile() === false) {
            //oversize our background elements for the scrolly thing
            this.mainContainer.addEventListener('mousemove', (evt) => { this.moveBackground(evt) })
            this.backgroundBackLayer.classList.add("overSize");
            this.backgroundFrontLayer.classList.add("overSize");
        }
    }

    getStartingDir() {
        return this.startingDirectory;
    }

    getCurrentDir() {
        return this.currentDirectory;
    }

    async fetchPage(fetchInfo) {
        const { pageURL } = fetchInfo.detail;

        if (/undefined/i.test(pageURL) || pageURL === this.currPageURL || this.barsInMotion > 0) {
            return;
        }
        
        const fetchResult  = await this.pageFetcher.getPage(pageURL);

        if (fetchResult !== false) {
            this.requestedPageInfo = fetchResult;
            this.reqPageURL = pageURL;

            this.handlePageChanges(pageURL);        
        }
    }

    processSelectedSubitems(currItems, newItems) {
        const newSelSubTopics = [];
        currItems.forEach(currItem => {
            let foundMatch = false;
            newItems.forEach(newItem => {
                if (currItem.id === newItem.id) {
                    newSelSubTopics.push(currItem);
                    foundMatch = true;
                }
            });
            if (foundMatch === false) {
                newSelSubTopics.push({
                    ...currItem,
                    status: 'remove',
                });
            }
        });

        //Next iterate over new items to ensure we have it all.
        newItems.forEach(currItem => {
            let foundMatch = false;
            newSelSubTopics.forEach(newItem => {
                if (currItem.id === newItem.id) {
                    foundMatch = true;
                }
            });
            if (foundMatch === false) {
                newSelSubTopics.push({
                    ...currItem,
                    status: 'add',
                });
            }
        });                
        
        return newSelSubTopics;
    }
    
    collectBarChanges(currHeaderInfo, reqHeaderInfo) {
        let pageChanged = false;
        let barChange = null;
        let subTopicChange = null;
        let selSubTopicsChange = [];
        let subTopicListChange = [];
        //First start with our selectedSubTopicInfo
        const { selectedSubTopicId:curSelectedSubTopicId } = currHeaderInfo;
        const { selectedSubTopicId:reqSelectedSubTopicId } = reqHeaderInfo;
        const { selectedSubTopicInfo:curSelectedSubTopicInfo } = currHeaderInfo;
        const { selectedSubTopicInfo:reqSelectedSubTopicInfo } = reqHeaderInfo;

        if (currHeaderInfo.id !== reqHeaderInfo.id) { //Bar change == everything change
            pageChanged = true;
            barChange = reqHeaderInfo.id;
            selSubTopicsChange = this.processSelectedSubitems(curSelectedSubTopicInfo, reqSelectedSubTopicInfo);
            subTopicListChange = reqHeaderInfo.subTopics;
        } else { //Bars are the same - check sub items

            if (curSelectedSubTopicId !== reqSelectedSubTopicId) {
                //SnyderD - this block handles when selected sub topics changes
                pageChanged = true;
                subTopicChange = reqSelectedSubTopicId;
                selSubTopicsChange = this.processSelectedSubitems(curSelectedSubTopicInfo, reqSelectedSubTopicInfo);
                subTopicListChange = reqHeaderInfo.subTopics;
            } else {
                //SnyderD - this block detects subMenu item clicks
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
                    
                    curSubTopicInfo.forEach((subTopic, iter) => {
                        const reqSubTopic = reqSubTopicInfo[iter];
                        if (reqSubTopic !== undefined) {
                            if (subTopic.id !== reqSubTopic.id) {
                                pageChanged = true;
                                subTopicListChange = reqSubTopicInfo;
                            } else if (subTopic.selected !== reqSubTopic.selected) {
                                pageChanged = true;
                                subTopicListChange.push(reqSubTopic);
                            }
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
        this.currentDirectory = `${content.dataset.dir}`;
              
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

    addSelectedSubTopicItems(barChanges, reqHeaderInfo, domSelectedSubTopicArea, currentDirectory) {
        const addItems = barChanges.selSubTopicsChange.filter(item => /add/.test(item.status));
        const addDOMSelSubItems = addItems.map(addItem => {
            const { selectedSubTopicBars } = reqHeaderInfo;
            const newBar = [...selectedSubTopicBars].filter(item => addItem.id === item.dataset.id);
            if (newBar !== null && newBar.length > 0) {
                let bar = newBar[0];
                bar.setAttribute("href", this.utils.linkAdjustor(`${addItem.href}`, this.startingDirectory, currentDirectory));
                return bar;
            }
        });
        addDOMSelSubItems.forEach(item => {
            item.setAttribute("added", "true");
            this.utils.appendEl(domSelectedSubTopicArea, item);
        });
    }

    addSubTopicItems(reqHeaderInfo, domHeaderSubNavArea, currentDirectory) {
        //Add new submenu items
        const { subTopicBars } = reqHeaderInfo;
        subTopicBars.forEach(item => {
            const newLink = this.utils.linkAdjustor(`${item.getAttribute("href")}`, this.startingDirectory, currentDirectory);
            item.setAttribute("href", newLink);
            item.setAttribute("added", "true");
            item.classList.add("staged");
            this.utils.createEl("li", {"role": "tab"}, [ item ], domHeaderSubNavArea);
        });
    }

    handlePageChanges(pageURL) {
        const { headerInfo:currHeaderInfo } = this.currentPageInfo;
        const { headerInfo:reqHeaderInfo } = this.requestedPageInfo;
        //extract the directory before it's inserted since this stuff fires before the content is actually updated
        const { content:newContent } = this.requestedPageInfo;
        const currentDirectory = `${newContent.dataset.dir}`;
        
        //Find out what changed on our UI
        const barChanges = this.collectBarChanges(currHeaderInfo, reqHeaderInfo);
        
        if (!barChanges.pageChanged) { //No page change - do nothing.
            return; 
        }

        //make some DOM pointers
        const domSelHeader = this.pageHeader.querySelector("TOPIC-BAR");
        let domSelectedSubTopicArea = domSelHeader.querySelector("DIV.selSubTopics");
        const domSelectedSubTopics = domSelectedSubTopicArea.querySelectorAll("SUB-TOPIC");
        let domHeaderSubNavArea = domSelHeader.querySelector("MENU.headerSubNav");
        const domSubTopics = domHeaderSubNavArea.querySelectorAll("SUB-TOPIC");

        if (barChanges.barChange === null) {
            //Start with our smallest change - subTopic item only changes
            if (barChanges.selSubTopicsChange.length === 0) {
                barChanges.subTopicListChange.forEach((reqSubTopic) => {
                    //grab our subTopic DOM item.
                    const subTopicDOM = [...domSubTopics].filter(top => top.dataset.id === reqSubTopic.id);
                    if (subTopicDOM !== null && subTopicDOM.length > 0) {
                        subTopicDOM[0].setAttribute("selected", reqSubTopic.selected);
                    }
                });
            } else { //We changed our selected sub topic (going up a menu)
                const removeItems = barChanges.selSubTopicsChange.filter(item => /remove/.test(item.status));
                const removeDOMSelSubItems = removeItems.map(remItem => {
                    const domItem = [...domSelectedSubTopics].filter(item => item.dataset.id === remItem.id);
                    if (domItem.length > 0) {
                        return domItem[0];
                    }
                });

                //Dismiss the remove items
                removeDOMSelSubItems.forEach(item => {
                    item.setAttribute("dismissed", "true");
                });                
                //Remove all submenu items
                domSubTopics.forEach(item => {
                    item.setAttribute("dismissed", "true");
                });
                
                //Next up.. populate our new sub items.
                //Add new selected SubTopic items
                this.addSelectedSubTopicItems(barChanges, reqHeaderInfo, domSelectedSubTopicArea, currentDirectory);
                //Add new submenu items
                this.addSubTopicItems(reqHeaderInfo, domHeaderSubNavArea, currentDirectory);
            }
        } else { //Topic Bar Change!
            //Get our bar to be promoted
            const promoteBar = this.unselectedBarArea.querySelector(`TOPIC-BAR[data-id="${barChanges.barChange}"]`);

            //Get the "home garage" where the bar is to return to
            const returnBarHome = this.unselectedBarArea.querySelector(`LI[data-id="${domSelHeader.dataset.id}"]`);
            
            //Grab some coordinates of where our bars are and need to go
            const rawPromoteBarPosData = this.pageHeader.getBoundingClientRect();
            const rawReturnBarHomePosData = returnBarHome.getBoundingClientRect();
            const topicBarMoveData = {
                home: {
                    x: rawReturnBarHomePosData.x,
                    y: rawReturnBarHomePosData.y,
                    width: rawReturnBarHomePosData.width,
                },
                promoted: {
                    x: rawPromoteBarPosData.x,
                    y: rawPromoteBarPosData.y,
                    width: rawPromoteBarPosData.width,
                }
            };
            
            //Quick Check to see if our promote bar has all the slot stuff
            const hasSelSubMenuArea = promoteBar !== null ? (promoteBar.querySelector("DIV.selSubTopics") !== null) : false;
            const hasSubMenuArea = promoteBar !== null ? (promoteBar.querySelector("DIV.subTopics") !== null) : false;
            
            //Create and append our new DOM stuff if needed.
            if (hasSelSubMenuArea === false) {
                //remap domSelectedSubTopicArea to our new bar
                domSelectedSubTopicArea = this.utils.createEl("div", { "class": "selSubTopics", "name": "selectedSubTopic" }, [], promoteBar);
            } else {
                domSelectedSubTopicArea = promoteBar.querySelector("DIV.selSubTopics");
            }
            if (hasSubMenuArea === false) {
                //remap domHeaderSubNavArea to our new bar
                domHeaderSubNavArea = this.utils.createEl("menu", { "class": "headerSubNav", "role": "tablist", "aria-label": "Sub Navigation" })
                this.utils.createEl("div", { "class": "subTopics", "name": "subTopics" }, [ domHeaderSubNavArea ], promoteBar);
            } else {
                domHeaderSubNavArea = promoteBar.querySelector("MENU.headerSubNav");
            }

            //Will also need code to remove the slots I think from domSelHeader - probably on animation finish though.
            const returnBar = this.utils.removeEl(domSelHeader); //Remove from Header element
            const { parentNode:barParent } = promoteBar;
            if (barParent !== null) {
                promoteBar.parentNode.setAttribute("aria-hidden", "true");
            }
            this.utils.removeEl(promoteBar); //Remove from LI "garage"
            this.utils.appendEl(returnBarHome, returnBar);
            returnBarHome.removeAttribute("aria-hidden");
            this.utils.appendEl(this.pageHeader, promoteBar);

            //Set our animation lockout to prevent bar spam
            this.barsInMotion = 2;
            //Set our attributes which will trigger bar animations
            promoteBar.setAttribute("promote", JSON.stringify(topicBarMoveData));
            returnBar.setAttribute("return", JSON.stringify(topicBarMoveData));

            //Add new selected SubTopic items
            this.addSelectedSubTopicItems(barChanges, reqHeaderInfo, domSelectedSubTopicArea, currentDirectory);
            //Add new submenu items
            this.addSubTopicItems(reqHeaderInfo, domHeaderSubNavArea, currentDirectory);                
        }

        //Unconditional stuff (content change)
        this.swapContent(this.requestedPageInfo.content);

        //Scroll content to top
        this.pageContent.scrollTop = 0;

        //Update our print thing
        const baseTitle = `${this.pageHeader.querySelector("DIV.barTextSlot").innerText}`;
        const subTopicTitle = [...domSelectedSubTopicArea.querySelectorAll("SUB-TOPIC")].map(topic => { return ` - ${topic.innerText}` });
        this.printTitle.innerHTML = `${baseTitle}${subTopicTitle}`;

        window.location.hash = pageURL;
        this.currPageURL = pageURL;
    }

    finishPageChanges() {
        //update our page info
        this.currentPageInfo = {...this.requestedPageInfo};
        this.requestedPageInfo = {};
    }

    //Special effect events
    moveBackground(evt) {
        const { clientX:x, clientY:y } = evt;
        const { height, width } = this.mainContainerInfo;
        const centerHeight = height / 2;
        const centerWidth = width / 2;
        
        const backLayer = document.querySelector("#backgroundBackLayer");
        const frontLayer = document.querySelector("#backgroundFrontLayer");

        const backMoveDampener = 50;
        const frontMoveDampener = 100;

        //shift our backgrounds depending on where our mouse is.
        backLayer.style.transform = `translate(${(centerWidth - x)/backMoveDampener}px, ${(centerHeight - y)/backMoveDampener}px)`;
        frontLayer.style.transform = `translate(${(centerWidth - x)/frontMoveDampener}px, ${(centerHeight - y)/frontMoveDampener}px)`;
    }

    //Hash changes for forward/backward button support.
    hashChange() {
        const { hash } = window.location;
        let cleanHash = hash.replace("#", "");
            
        if (cleanHash !== this.reqPageURL) { //Prevents a "bounce"
            this.fetchPage({ detail: { pageURL: cleanHash } });
        }
    }
    
    finalizeBoot() {
        bootSequence.sparky();
            
        if (this.utils.getIsMobile() === false) {
            //add our background effect hook back in.
            this.mainContainer.addEventListener('mousemove', (evt) => { this.moveBackground(evt) })
        }
    }

    //Loader stuffs
    showLoader() {
        if (this.loader === null) {
            const { innerWidth, innerHeight } = window;
            const loaderText = this.utils.createEl("div", {"class": "loaderText"}, [ "Accessing..." ]);
            this.loader = this.utils.createEl("div", {"id": "loader"}, [ loaderText ], this.mainContainer);
            loaderText.style.top = `${innerHeight/2 - loaderText.offsetHeight/2}px`;
            loaderText.style.left = `${innerWidth/2 - loaderText.offsetWidth/2}px`;
        }
    }

    hideLoader() {
        if (this.loader !== null) {
            this.utils.removeEl(this.loader);
            this.loader = null;
        }
    }

    barMotionEnd() {
        this.barsInMotion -= 1;
    }
    //Form stuffs
    checkContactForm(evt) {
        const postData = this.utils.checkContactForm(evt);

        if (postData !== null) {
            this.submitContactForm(postData);
        }
    }

    async submitContactForm(postData) {
        let postURL = this.utils.linkAdjustor('parser.php'); 
        const { protocol } = window.location;
        //Local dev testing
        if (/file/.test(protocol)) {
            postURL = this.utils.linkAdjustor('dummyParser.html');
        }
        const rawResult = await this.pageFetcher.postData(postURL, postData) || "";
        const result = JSON.parse(rawResult.replaceAll(`'`, `"`));
        const resultDisplay = this.contentPanel.querySelector("DIV.contactResult");
        const submitButton = this.contentPanel.querySelector("INPUT[type='submit']");
        
        resultDisplay.innerHTML = `${result.status}`
        resultDisplay.classList.remove("hide");

        if (Number(result.result) === 1) {
            submitButton.setAttribute("disabled", "disabled");
        }

    }

}

const pageMaestro = new Maestro();
pageMaestro.init();