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
        this.currentDirectory = `${this.pageContent.dataset.dir}`;
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

    getStartingDir() {
        return this.startingDirectory;
    }

    getCurrentDir() {
        return this.currentDirectory;
    }

    async fetchPage(fetchInfo) {
        const { pageURL } = fetchInfo.detail;
        
        if (pageURL === this.currentPageInfo.headerInfo.href) {
            return; //nothing to do.
        }

        this.requestedPageInfo = await this.pageFetcher.getPage(pageURL);
        window.location.hash = pageURL;
        
        this.handlePageChanges();        
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

        if (newItems.length > currItems.length) {
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
        }

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

    handlePageChanges() {
        const { headerInfo:currHeaderInfo } = this.currentPageInfo;
        const { headerInfo:reqHeaderInfo } = this.requestedPageInfo;
        //extract the directory before it's inserted since this stuff fires before the content is actually updated
        const { content:newContent } = this.requestedPageInfo;
        const currentDirectory = `${newContent.dataset.dir}`;
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
            } else { //We changed our selected sub topic (going up a menu)
                const removeItems = barChanges.selSubTopicsChange.filter(item => /remove/.test(item.status));
                const addItems = barChanges.selSubTopicsChange.filter(item => /add/.test(item.status));
                const removeDOMSelSubItems = removeItems.map(remItem => {
                    const domItem = [...domSelectedSubTopics].filter(item => item.dataset.id === remItem.id);
                    if (domItem.length > 0) {
                        return domItem[0];
                    }
                });
                const addDOMSelSubItems = addItems.map(addItem => {
                    const { selectedSubTopicBars } = reqHeaderInfo;
                    const newBar = [...selectedSubTopicBars].filter(item => addItem.id === item.dataset.id);
                    if (newBar !== null && newBar.length > 0) {
                        let bar = newBar[0];
                        bar.setAttribute("href", this.utils.linkAdjustor(`${addItem.href}`, this.startingDirectory, currentDirectory));
                        return bar;
                    }
                });
                //Dismiss the remove items
                removeDOMSelSubItems.forEach(item => {
                    item.setAttribute("dismissed", "true");
                });
                //Add the add items
                addDOMSelSubItems.forEach(item => {
                    item.setAttribute("added", "true");
                    domSelectedSubTopicArea.appendChild(item);
                });

                //Next up.. populate our new sub items.
                //Remove all submenu items
                domSubTopics.forEach(item => {
                    item.setAttribute("dismissed", "true");
                });

                //Add new submenu items
                const { subTopicBars } = reqHeaderInfo;
                subTopicBars.forEach(item => {
                    const newLink = this.utils.linkAdjustor(`${item.getAttribute("href")}`, this.startingDirectory, currentDirectory);
                    item.setAttribute("href", newLink);
                    item.setAttribute("added", "true");
                    item.classList.add("staged");
                    const newLi = document.createElement("li");
                    newLi.appendChild(item);
                    domHeaderSubNavArea.appendChild(newLi);
                });
            }
        } else { //Topic Bar Change!
            //this.pageHeader = this.mainContainer.querySelector("#selectedBar");
            //this.unselectedBarArea = this.mainContainer.querySelector("#unSelectedBarArea");
            //const domSelHeader = this.pageHeader.querySelector("TOPIC-BAR");
        
            //Get our bar to be promoted
            const promoteBar = this.unselectedBarArea.querySelector(`TOPIC-BAR[data-id="${barChanges.barChange}"]`);

            //Get the "home garage" where the bar is to return to
            const returnBarHome = this.unselectedBarArea.querySelector(`LI[data-id="${domSelHeader.dataset.id}"]`);
            
            //Dismiss all submenu items
            const oldSubTopicItems = domSelHeader.querySelectorAll(`SUB-TOPIC`);
            oldSubTopicItems.forEach(subTopic => {
                subTopic.setAttribute("dismissed", "true");
            });


            //Selected Bar CSS #selectedBar - top:5px left:185px - width: domSelHeader.offsetWidth
            //bar Garage CSS #unSelectedBarArea - top:160px left:3px width:176
            //position in garage - offsetTop (180)

            //domSelHeader.setAttribute("return");


            //Swap parent nodes - might need to put this after animation completes
            //Add stuff into promote bar
            // <div name="selectedSubTopic" class="selSubTopics"></div>
            // <div name="subTopics" class="subTopics">
			// 	<!-- Begin Submenu Items -->
			// 	<menu class="headerSubNav" role="navigation" aria-label="Sub Navigation"></menu>
            //Quick Check to see if our promote bar has all the slot stuff
            const hasSelSubMenuArea = promoteBar.querySelector("DIV.selSubTopics") !== null;
            const hasSubMenuArea = promoteBar.querySelector("DIV.subTopics") !== null;
            
            //debugger;
            const selSubTopicsArea = document.createElement("DIV");
            selSubTopicsArea.setAttribute("name", "selectedSubTopic");
            selSubTopicsArea.setAttribute("class", "selSubTopics");
            const subTopicsArea = document.createElement("DIV");
            subTopicsArea.setAttribute("name", "subTopics");
            subTopicsArea.setAttribute("class", "subTopics");
            const subTopicMenu = document.createElement("MENU");
            subTopicMenu.setAttribute("class", "headerSubNav");
            subTopicMenu.setAttribute("role", "navigation");
            subTopicMenu.setAttribute("aria-label", "Sub Navigation");
            subTopicsArea.appendChild(subTopicMenu);
            promoteBar.appendChild(selSubTopicsArea);
            promoteBar.appendChild(subTopicsArea);

            //Will also need code to remove the slots I think from domSelHeader - probably on animation finish though.
            
            const returnBar = this.pageHeader.removeChild(domSelHeader); //Remove from Header element
            promoteBar.parentNode.removeChild(promoteBar); //Remove from LI "garage"
            returnBarHome.appendChild(returnBar);
            this.pageHeader.appendChild(promoteBar);

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