class Maestro {
    constructor() {
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

        this.pageFetcher = pageFetcher;
        this.utils = utils;

        //Get information about where we're starting
        this.currentPageInfo = this.pageFetcher.extractPageInfo(document);
        this.requestedPageInfo = {};
        
        //Convert hyperlinks in page body
        const { pathname } = window.location;
        const { href } = window.location;
        const rawPath = pathname.replace(/\\/gi,"/").substring(0, pathname.replace(/\\/gi,"/").lastIndexOf("/") + 1);
        const fileName = href.substring(href.lastIndexOf("/") + 1, href.length);
        this.currentDirectory = `${this.pageContent.dataset.dir}`;
        this.currPageURL = `${this.currentDirectory}${fileName}`;
        this.reqPageURL = "";
        this.startingDirectory = rawPath.replace(this.currentDirectory, "");
        this.initialized = false;
            
        this.utils.adjustLinks(this.pageContent, this.mainContainer, this.startingDirectory, this.currentDirectory);
    }

    //Methods
    init() {
        //Selected Topic Bar events
        this.pageHeader.addEventListener('removeSubTopic', (evt) => { this.removeSubTopic(evt) });   

        //Content Panel events
        this.mainContainer.addEventListener('fetchPage', (evt) => { this.fetchPage(evt) });   
        this.mainContainer.addEventListener('showShot', (evt) => { this.utils.showShot(evt) });
        this.mainContainer.addEventListener('mousemove', (evt) => { this.moveBackground(evt) })
        window.addEventListener("popstate", () => { this.hashChange() });

        const { hash } = window.location;
        let cleanHash = hash.replace("#", "");
        if (this.initialized === false && cleanHash === "") { // no hash means a fresh hit
            //Call our future Init function here!
            console.log(`Begin fancy stuffs!!!!`);
        } else {
            this.fetchPage({ detail: { pageURL: cleanHash } });
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

        if (/undefined/i.test(pageURL) || pageURL === this.currPageURL) {
            return;
        }
        
        this.requestedPageInfo = await this.pageFetcher.getPage(pageURL);
        this.reqPageURL = pageURL;

        this.handlePageChanges(pageURL);        
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
            this.utils.createEl("LI", {}, [ item ], domHeaderSubNavArea);
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
            
            //Dismiss all submenu items
            const oldSubTopicItems = domSelHeader.querySelectorAll(`SUB-TOPIC`);
            oldSubTopicItems.forEach(subTopic => {
                subTopic.setAttribute("dismissed", "true");
            });

            //Grab some coordinates of where our bars are and need to go
            const rawPromoteBarPosData = domSelHeader.getBoundingClientRect();
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
            const hasSelSubMenuArea = promoteBar.querySelector("DIV.selSubTopics") !== null;
            const hasSubMenuArea = promoteBar.querySelector("DIV.subTopics") !== null;
            
            //Create and append our new DOM stuff if needed.
            if (hasSelSubMenuArea === false) {
                //remap domSelectedSubTopicArea to our new bar
                domSelectedSubTopicArea = this.utils.createEl("DIV", { "class": "selSubTopics", "name": "selectedSubTopic" }, [], promoteBar);
            } else {
                domSelectedSubTopicArea = promoteBar.querySelector("DIV.selSubTopics");
            }
            if (hasSubMenuArea === false) {
                //remap domHeaderSubNavArea to our new bar
                domHeaderSubNavArea = this.utils.createEl("MENU", { "class": "headerSubNav", "role": "navigation", "aria-label": "Sub Navigation" })
                this.utils.createEl("DIV", { "class": "subTopics", "name": "subTopics" }, [ domHeaderSubNavArea ], promoteBar);
            } else {
                domHeaderSubNavArea = promoteBar.querySelector("MENU.headerSubNav");
            }

            //Will also need code to remove the slots I think from domSelHeader - probably on animation finish though.
            const returnBar = this.utils.removeEl(domSelHeader); //Remove from Header element
            this.utils.removeEl(promoteBar); //Remove from LI "garage"
            this.utils.appendEl(returnBarHome, returnBar);
            this.utils.appendEl(this.pageHeader, promoteBar);

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

        window.location.hash = pageURL;
        this.currPageURL = pageURL;
    }

    finishPageChanges() {
        //update our page info
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

    //Special effect events
    moveBackground(evt) {
        const x = evt.clientX;
        const y = evt.clientY;

        const { height, width } = this.mainContainerInfo;
        const centerHeight = height / 2;
        const centerWidth = width / 2;
        
        const backLayer = document.querySelector("#backgroundBackLayer");
        const frontLayer = document.querySelector("#backgroundFrontLayer");

        const backMoveDampener = 10;
        const frontMoveDampener = 20;

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

    checkContactForm(evt) {
        const { name } = evt;
        const { email } = evt;
        const { message } = evt;
        const nameErr = name.parentNode.parentNode.querySelector("DIV.errMsg");
        const emailErr = email.parentNode.parentNode.querySelector("DIV.errMsg");
        const messageErr = message.parentNode.parentNode.querySelector("DIV.errMsg");
        const { value:nameVal } = name;
        const { value:emailVal } = email;
        const { value:messageVal } = message;
        let good = true;
        
        if (nameVal.length < 3) {
            name.classList.add("err");
            nameErr.innerText = "Please enter your name.";
            good = false;
        } else {
            name.classList.remove("err");
            nameErr.innerText = "";
        }

        if (emailVal.length < 5 ) {
            email.classList.add("err");
            emailErr.innerText = "Please enter your email address.";
            good = false;
        } else if (/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(emailVal) === false) {
            email.classList.add("err");
            emailErr.innerText = "Please enter a valid email address.";
            good = false;
        } else {
            email.classList.remove("err");
            emailErr.innerText = "";
        }

        if (messageVal.length < 5) {
            message.classList.add("err");
            messageErr.innerText = "Please enter a message";
            good = false;
        } else {
            message.classList.remove("err");
            messageErr.innerText = "";
        }

        if(good === true) {
            const data = new URLSearchParams();
            data.append("name", nameVal);
            data.append("email", emailVal);
            data.append("message", messageVal);
            
            this.submitContactForm(data);
        }

    }

    async submitContactForm(postData) {
            
        const result = await this.pageFetcher.postData("https://www.snydersweb.com/contact/parser.php", postData);
        console.log(`result`);
        console.dir(result);

    }
}

const pageMaestro = new Maestro();
pageMaestro.init();