class Maestro {
    constructor() {
        //Set up bindings to important areas of the page
        this.mainContainer = document.querySelector('#mainContainer');
        this.logo = this.mainContainer.querySelector('#logo');
        this.pageHeader = this.mainContainer.querySelector('#selectedBar');
        this.unselectedBarArea = this.mainContainer.querySelector('#unSelectedBarArea');
        this.contentPanel = this.mainContainer.querySelector('#contentPanel');
        this.pageContent = this.mainContainer.querySelector('#content');
        const printBanner = document.querySelector('#printBanner');
        this.printTitle = printBanner.querySelector('div.printTitle');

        //Get some base context info
        const { pathname, href } = window.location;
        const rawPath = pathname.replace(/\\/gi, '/').substring(0, pathname.replace(/\\/gi, '/').lastIndexOf('/') + 1);
        const fileName = href.substring(href.lastIndexOf('/') + 1, href.length);
        this.currentDirectory = `${this.pageContent.dataset.dir}`;
        this.currPageURL = `${this.currentDirectory}${fileName}`;
        this.reqPageURL = '';
        this.startingDirectory = rawPath.replace(this.currentDirectory, '');

        //Not doing anything with the background stuff for now
        this.backgroundBackLayer = document.querySelector('#backgroundBackLayer');
        this.backgroundFrontLayer = document.querySelector('#backgroundFrontLayer');
        this.orientTimeout = 0;
        this.resizeTimeout = 0;

        //Information about where we're starting
        this.currentPageInfo = {};
        this.requestedPageInfo = {};

        //Convert hyperlinks in page body
        this.initialized = false;
        this.loader = null;
        this.barsInMotion = 0;
        this.isMobile = false;
    }
    
    //Methods
    async init() {
        
        await Promise.all(
            //Grab our script modules
            [
                'scripts/utils.js',
                'scripts/pageFetcher.js',
                'scripts/specialEffects.js',
            ].map(async x => {
                const curDirParts = this.currentDirectory.split('/');
                const dirBackStep = curDirParts.map(() => '../').splice(0, 1).join('');

                const adjustedSrc = `${dirBackStep}${x}`;

                await import(adjustedSrc).then((script) => {
                    const { default: payload } = script;
                    for (let item in payload) {
                        window[item] = payload[item];
                    }
                });
            })
        ).then(() => {
            this.startInterface();
        });
    }

    async iosRequestPermission() {
        try {
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                // iOS 13+ – explicit user gesture needed
                const response = await DeviceOrientationEvent.requestPermission();
                if (response === 'granted') {
                    window.addEventListener('deviceorientation', (evt) => { specialEffects.moveBackground(evt, true); });
                } else {
                    window.removeEventListener('deviceorientation', (evt) => { specialEffects.moveBackground(evt, true); });
                }
            } else {
                window.addEventListener('deviceorientation', (evt) => { specialEffects.moveBackground(evt, true); });
            }
        } catch(err) {}

        try {
            if (typeof DeviceMotionEvent.requestPermission === 'function') {
                // iOS 13+ – explicit user gesture needed
                const response = await DeviceMotionEvent.requestPermission();
                if (response === 'granted') {
                    window.addEventListener('devicemotion', (evt) => { specialEffects.detectShake(evt); });
                } else {
                    window.removeEventListener('devicemotion', (evt) => { specialEffects.detectShake(evt); });
                }
            } else {
                window.addEventListener('devicemotion', (evt) => { specialEffects.detectShake(evt); });
            }
        } catch(err) {}
    }

    startInterface() {
        this.isMobile = utils.getIsMobile();

        //Selected Topic Bar events
        this.pageHeader.addEventListener('removeSubTopic', (evt) => { this.removeSubTopic(evt) });

        //Content Panel events
        this.mainContainer.addEventListener('fetchPage', (evt) => { this.fetchPage(evt) });
        this.mainContainer.addEventListener('showShot', (evt) => { utils.showShot(evt) });
        this.mainContainer.addEventListener('fetchStart', () => { this.showLoader() });
        this.mainContainer.addEventListener('fetchEnd', () => { this.hideLoader() });
        this.mainContainer.addEventListener('barMotionEnd', () => { this.barMotionEnd() });
        // Had to put a setTimeout on this one to allow the UI a tiny fraction to settle after the event.
        window.addEventListener('orientationchange', () => { 
            clearTimeout(this.orientTimeout);
            this.orientTimeout = setTimeout(() => { specialEffects.resizeBackground(); }, 100)
        });
        window.addEventListener('resize', () => { 
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => { specialEffects.resizeBackground(); }, 100)
        });
        window.addEventListener('popstate', () => { this.hashChange() });

        //get our first page.
        this.currentPageInfo = pageFetcher.extractPageInfo(document);
        this.adjustLinks(this.pageContent, this.mainContainer, this.currentDirectory, this.startingDirectory);

        const { hash } = window.location;
        let cleanHash = hash.replace('#', '');
        const itemHandles = {
                backgroundBackLayer: this.backgroundBackLayer,
                backgroundFrontLayer: this.backgroundFrontLayer,
                mainContainer: this.mainContainer,
                logo: this.logo,
                pageHeader: this.pageHeader,
                unselectedBarArea: this.unselectedBarArea,
                contentPanel: this.contentPanel,
            };

        specialEffects.setHandles(itemHandles);
                        
        if (this.initialized === false && cleanHash === '') { // no hash means a fresh hit
            this.mainContainer.addEventListener('finalizeBoot', (evt) => { this.finalizeBoot(evt) });

            //hide the elements at first.
            for (let item in itemHandles) {
                itemHandles[item].style.visibility = 'hidden';
            }

            specialEffects.bootSequence(itemHandles);
        } else {
            specialEffects.sparky();
            this.fetchPage({ detail: { pageURL: cleanHash } });
        }
        
        specialEffects.resizeBackground();
        if (this.isMobile === false) {
            this.mainContainer.addEventListener('mousemove', (evt) => { specialEffects.moveBackground(evt, false); });
        } else {
            const requestPermissions = async () => {
                await this.iosRequestPermission();
            };

            if (typeof DeviceMotionEvent.requestPermission === 'function' ||
                typeof DeviceOrientationEvent.requestPermission === 'function') {
                this.mainContainer.addEventListener('click', requestPermissions, { once: true });
                this.mainContainer.addEventListener('touchstart', requestPermissions, { once: true, passive: false });
            } else {
                this.iosRequestPermission();
            }
        }              
    }

    linkAdjustor(linkLoc, currentDirectory = this.getCurrentDir(), startingDirectory = this.getStartingDir()) {
        const fileName = linkLoc.substring(linkLoc.lastIndexOf('/'), linkLoc.length);
        const linkLocParts = linkLoc.replace(fileName, '').split('/').filter(item => item === '..');
        const cdParts = currentDirectory.slice(0, -1).split('/');
        const chopFactor = cdParts.length - linkLocParts.length;
        const linkPath = cdParts
            .slice(0, 0 + (chopFactor))
            .filter((item, index) => cdParts.indexOf(item) === index) //Quick check to ensure we don't have dups
            .join('/');

        return (`${startingDirectory}${linkPath}/${linkLoc.replaceAll('../', '')}`).replaceAll('//', '/');
    }

    adjustLinks(pageContent, mainContainer, currentDirectory, startingDirectory) {
        const contentLinks = pageContent.querySelectorAll('a');
        const imgRegEx = new RegExp(/\.gif|\.jpg|\.png|\.svg/i);

        contentLinks.forEach((link, current) => {
            const { href } = link; //This returns some form of "Reconciled" location.. 
            const trueHref = link.getAttribute('href');
            const { nofetch: rawNoFetch } = link.dataset;
            const noFetch = /true/i.test(rawNoFetch); //Some links we do NOT want going through the fetch system!
            const isAbsoluteURL = /http/i.test(trueHref);

            if (isAbsoluteURL === false && /mailto/i.test(trueHref) === false && imgRegEx.test(trueHref) === false) {
                if (noFetch === false) { //NOT Link to external
                    const linkHref = this.linkAdjustor(trueHref, currentDirectory, startingDirectory);

                    const linkClickEvent = new CustomEvent(
                        'fetchPage',
                        {
                            detail: {
                                pageURL: linkHref
                            },
                            bubbles: false,
                            cancelable: true,
                        }
                    );

                    link.setAttribute('href', 'JavaScript:void(0);');
                    link.dataset.link = linkHref;
                    link.addEventListener('click', () => { mainContainer.dispatchEvent(linkClickEvent); });
                        
                } else {
                    const linkHref = this.linkAdjustor(trueHref, currentDirectory, startingDirectory);
                    link.setAttribute('href', linkHref);
                }
            } else if (imgRegEx.test(href)) { //special image link

                const linkHref = isAbsoluteURL === false ? this.linkAdjustor(trueHref, currentDirectory, startingDirectory) : trueHref;

                const linkClickEvent = new CustomEvent(
                    'showShot',
                    {
                        detail: {
                            pageURL: linkHref,
                            name: 'screen_shot',
                            resize: true,
                            width: 'auto',
                            height: 'auto',
                        },
                        bubbles: false,
                        cancelable: true,
                    }
                );

                link.setAttribute('href', 'JavaScript:void(0);');
                link.addEventListener('click', () => { mainContainer.dispatchEvent(linkClickEvent); });
            }
        });
    }

    adjustImages(pageContent, currentDirectory, startingDirectory) {
        const contentImages = pageContent.querySelectorAll('img');
        contentImages.forEach((img) => {
            const trueHref = img.getAttribute('src');
            const linkHref = this.linkAdjustor(trueHref, currentDirectory, startingDirectory);
            img.setAttribute('src', linkHref);
        });
    }

    getStartingDir() {
        return this.startingDirectory;
    }

    getCurrentDir() {
        return this.currentDirectory;
    }

    async fetchPage(fetchInfo) {
        const { pageURL } = fetchInfo.detail;

        if (this.isMobile && navigator && navigator.vibrate) { //Apparently this doesn't work so well with iOS...
            try {
                navigator.vibrate(10); //Haptic feedback
            } catch (err) {}
        }

        if (/undefined/i.test(pageURL) || pageURL === this.currPageURL || this.barsInMotion > 0) {
            return;
        }

        const fetchResult = await pageFetcher.getPage(pageURL);

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
        const { selectedSubTopicId: curSelectedSubTopicId } = currHeaderInfo;
        const { selectedSubTopicId: reqSelectedSubTopicId } = reqHeaderInfo;
        const { selectedSubTopicInfo: curSelectedSubTopicInfo } = currHeaderInfo;
        const { selectedSubTopicInfo: reqSelectedSubTopicInfo } = reqHeaderInfo;

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
                    const { subTopics: curSubTopicInfo } = currHeaderInfo;
                    const { subTopics: reqSubTopicInfo } = reqHeaderInfo;

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
            easing: 'ease-out',
        });
        fadeOut.addEventListener('finish', () => {
            this.pageContent.innerHTML = content.innerHTML;
            this.adjustLinks(this.pageContent, this.mainContainer, this.currentDirectory, this.startingDirectory);
            this.adjustImages(this.pageContent, this.currentDirectory, this.startingDirectory);

            const fadeIn = this.pageContent.animate([
                {
                    opacity: 0,
                },
                {
                    opacity: 1,
                },
            ], {
                duration: 250,
                easing: 'ease-in',
            });

            fadeIn.addEventListener('finish', () => {
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
                bar.setAttribute('href', this.linkAdjustor(`${addItem.href}`, currentDirectory, this.startingDirectory));
                return bar;
            }
        });
        addDOMSelSubItems.forEach(item => {
            item.setAttribute('added', 'true');
            utils.appendEl(domSelectedSubTopicArea, item);
        });
    }

    addSubTopicItems(reqHeaderInfo, domHeaderSubNavArea, currentDirectory) {
        //Add new submenu items
        const { subTopicBars } = reqHeaderInfo;
        subTopicBars.forEach(item => {
            const newLink = this.linkAdjustor(`${item.getAttribute('href')}`, currentDirectory, this.startingDirectory);
            item.setAttribute('href', newLink);
            item.setAttribute('added', 'true');
            item.classList.add('staged');
            utils.createEl('li', { 'role': 'tab' }, [item], domHeaderSubNavArea);
        });
    }

    handlePageChanges(pageURL) {
        const { headerInfo: currHeaderInfo } = this.currentPageInfo;
        const { headerInfo: reqHeaderInfo } = this.requestedPageInfo;
        //extract the directory before it's inserted since this stuff fires before the content is actually updated
        const { content: newContent } = this.requestedPageInfo;
        const currentDirectory = `${newContent.dataset.dir}`;

        //Find out what changed on our UI
        const barChanges = this.collectBarChanges(currHeaderInfo, reqHeaderInfo);

        if (barChanges.pageChanged === false || currHeaderInfo === undefined || reqHeaderInfo === undefined) { //No page change - do nothing.
            return;
        }

        //make some DOM pointers
        const domSelHeader = this.pageHeader.querySelector('topic-bar');
        let domSelectedSubTopicArea = domSelHeader.querySelector('div.selSubTopics');
        const domSelectedSubTopics = domSelectedSubTopicArea.querySelectorAll('sub-topic');
        let domHeaderSubNavArea = domSelHeader.querySelector('menu.headerSubNav');
        const domSubTopics = domHeaderSubNavArea !== null ? domHeaderSubNavArea.querySelectorAll('sub-topic') : [];

        if (barChanges.barChange === null) {
            //Start with our smallest change - subTopic item only changes
            if (barChanges.selSubTopicsChange.length === 0) {
                barChanges.subTopicListChange.forEach((reqSubTopic) => {
                    //grab our subTopic DOM item.
                    const subTopicDOM = [...domSubTopics].filter(top => top.dataset.id === reqSubTopic.id);
                    if (subTopicDOM !== null && subTopicDOM.length > 0) {
                        subTopicDOM[0].setAttribute('selected', reqSubTopic.selected);
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
                    item.setAttribute('dismissed', 'true');
                });
                //Remove all submenu items
                domSubTopics.forEach(item => {
                    item.setAttribute('dismissed', 'true');
                });

                //Next up.. populate our new sub items.
                //Add new selected SubTopic items
                this.addSelectedSubTopicItems(barChanges, reqHeaderInfo, domSelectedSubTopicArea, currentDirectory);
                //Add new submenu items
                this.addSubTopicItems(reqHeaderInfo, domHeaderSubNavArea, currentDirectory);
            }
        } else { //Topic Bar Change!
            //Get our bar to be promoted
            const promoteBar = this.unselectedBarArea.querySelector(`topic-bar[data-id='${barChanges.barChange}']`);

            //Get the "home garage" where the bar is to return to
            const returnBarHome = this.unselectedBarArea.querySelector(`li[data-id='${domSelHeader.dataset.id}']`);

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
            const hasSelSubMenuArea = promoteBar !== null ? (promoteBar.querySelector('div.selSubTopics') !== null) : false;
            const hasSubMenuArea = promoteBar !== null ? (promoteBar.querySelector('div.subTopics') !== null) : false;

            //Create and append our new DOM stuff if needed.
            if (hasSelSubMenuArea === false) {
                //remap domSelectedSubTopicArea to our new bar
                domSelectedSubTopicArea = utils.createEl('div', { 'class': 'selSubTopics', 'name': 'selectedSubTopic' }, [], promoteBar);
            } else {
                domSelectedSubTopicArea = promoteBar.querySelector('div.selSubTopics');
            }
            if (hasSubMenuArea === false) {
                //remap domHeaderSubNavArea to our new bar
                domHeaderSubNavArea = utils.createEl('menu', { 'class': 'headerSubNav', 'role': 'tablist', 'aria-label': 'Sub Navigation' })
                utils.createEl('div', { 'class': 'subTopics', 'name': 'subTopics' }, [domHeaderSubNavArea], promoteBar);
            } else {
                domHeaderSubNavArea = promoteBar.querySelector('menu.headerSubNav');
            }

            //Will also need code to remove the slots I think from domSelHeader - probably on animation finish though.
            const returnBar = utils.removeEl(domSelHeader); //Remove from Header element
            const { parentNode: barParent } = promoteBar;
            if (barParent !== null) {
                promoteBar.parentNode.setAttribute('aria-hidden', 'true');
            }
            utils.removeEl(promoteBar); //Remove from LI "garage"
            utils.appendEl(returnBarHome, returnBar);
            returnBarHome.removeAttribute('aria-hidden');
            utils.appendEl(this.pageHeader, promoteBar);

            //Set our animation lockout to prevent bar spam
            this.barsInMotion = 2;
            //Set our attributes which will trigger bar animations
            promoteBar.setAttribute('promote', JSON.stringify(topicBarMoveData));
            returnBar.setAttribute('return', JSON.stringify(topicBarMoveData));

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
        const baseTitle = `${this.pageHeader.querySelector('div.barTextSlot').innerText}`;
        const subTopicTitle = [...domSelectedSubTopicArea.querySelectorAll('sub-topic')].map(topic => { return ` - ${topic.innerText}` });
        this.printTitle.innerHTML = `${baseTitle}${subTopicTitle}`;

        window.location.hash = pageURL;
        this.currPageURL = pageURL;
    }

    finishPageChanges() {
        //update our page info
        if (this.requestedPageInfo !== undefined && this.requestedPageInfo.headerInfo !== undefined) {
            this.currentPageInfo = { ...this.requestedPageInfo };
            this.requestedPageInfo = {};
        }

        //Execute in-line body scripts.
        const bodyScripts = this.pageContent.querySelectorAll('script');
        bodyScripts.forEach(item => {
            try {
                eval?.(item.innerText);
            } catch (err) {}
        });
    }

    //Hash changes for forward/backward button support.
    hashChange() {
        const { hash } = window.location;
        let cleanHash = hash.replace('#', '');

        if (cleanHash !== this.reqPageURL) { //Prevents a "bounce"
            this.fetchPage({ detail: { pageURL: cleanHash } });
        }
    }

    finalizeBoot() {
        specialEffects.sparky();
    }

    //Loader stuffs
    showLoader() {
        if (this.loader === null) {
            const { innerWidth, innerHeight } = window;
            const loaderText = utils.createEl('div', { 'class': 'loaderText' }, ['Accessing...']);
            this.loader = utils.createEl('div', { 'id': 'loader' }, [loaderText], this.mainContainer);
            loaderText.style.top = `${innerHeight / 2 - loaderText.offsetHeight / 2}px`;
            loaderText.style.left = `${innerWidth / 2 - loaderText.offsetWidth / 2}px`;
        }
    }

    hideLoader() {
        if (this.loader !== null) {
            utils.removeEl(this.loader);
            this.loader = null;
        }
    }

    barMotionEnd() {
        this.barsInMotion -= 1;
    }
}

const pageMaestro = new Maestro();
pageMaestro.init();