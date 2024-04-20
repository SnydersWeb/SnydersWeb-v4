const pageFetcher = {
    activeFetch: false,
    engineScripts: [
        'componentTemplates/topicBarComponent.js',
        'componentTemplates/subTopicComponent.js',
        'scripts/topicBarComponent.js',
        'scripts/subTopicComponent.js',
        'scripts/maestro.js'
    ],
    extraScriptRegistry: [],
    currReqUrl: '',
    fetchStartEvent: new CustomEvent(
        'fetchStart',
        {
            detail: {},
            bubbles: false,
            cancelable: true,
        }
    ),
    fetchEndEvent: new CustomEvent(
        'fetchEnd',
        {
            detail: {},
            bubbles: false,
            cancelable: true,
        }
    ),
    mainContainer: document.querySelector('#mainContainer'),
    postData(url = '', data = {}) {
        if (this.activeFetch === true) {
            return false;
        }
        this.mainContainer.dispatchEvent(this.fetchStartEvent);
        this.activeFetch = true
        // Default options are marked with *
        return fetch(url, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: data
        })
            // fetch() returns a promise. When we have received a response from the server,
            // the promise's 'then()' handler is called with the response.
            .then((response) => {
                // Our handler throws an error if the request did not succeed.
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                this.activeFetch = false;
                this.mainContainer.dispatchEvent(this.fetchEndEvent);
                return response.text();
            })
            .catch((error) => {
                this.activeFetch = false;
                this.mainContainer.dispatchEvent(this.fetchEndEvent);
                console.log(`Could not fetch result: ${error}`);
            });
    },
    getPage(url) {
        if (this.activeFetch === true) {
            return false;
        }
        this.mainContainer.dispatchEvent(this.fetchStartEvent);
        this.activeFetch = true
        this.currReqUrl = url;
        // Call 'fetch()', passing in the URL.
        return fetch(url)
            // fetch() returns a promise. When we have received a response from the server,
            // the promise's 'then()' handler is called with the response.
            .then((response) => {
                // Our handler throws an error if the request did not succeed.
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                // Otherwise (if the response succeeded), our handler fetches the response
                // as text by calling response.text(), and immediately returns the promise
                // returned by 'response.text()'.
                return response.text();
            })
            .then((rawHtml) => {
                this.activeFetch = false;
                this.mainContainer.dispatchEvent(this.fetchEndEvent);
                return this.parsePageObject(rawHtml);
            })
            .catch((error) => {
                this.activeFetch = false;
                this.mainContainer.dispatchEvent(this.fetchEndEvent);
                console.log(`Could not fetch page: ${error}`);
            });
    },
    parsePageObject(rawHtml) {
        const xmlDoc = new DOMParser().parseFromString(rawHtml, 'text/html');

        return this.extractPageInfo(xmlDoc);
    },
    async loadScript(script, dirBackStep, reqDocDir) {

        const scriptSrc = script.getAttribute('src');
        const adjustedSrc = `${dirBackStep}${reqDocDir}${scriptSrc}`; //pageMaestro.linkAdjustor(scriptSrc, dirContext, startDir);

        //Ideally we would do this via import but since our scripts can be accessed more than one way
        new Promise((resolve, reject) => {
            const script = document.createElement('script');
            document.body.appendChild(script);
            script.onload = resolve;
            script.onerror = reject;
            script.async = true;
            script.src = adjustedSrc;
        });

        //Add it to our registry
        this.extraScriptRegistry.push(`${adjustedSrc}`);
    },
    fetchScripts(pageScripts, reqDocDir) {
        if (this.currReqUrl !== '') { //currReqUrl would ONLY be blank for an initial page load!
            const dirBackStep = this.currReqUrl.includes('../') ? this.currReqUrl.substring(0, this.currReqUrl.lastIndexOf('../') + 3) : '';
            
            //Need a quick check here to see if thisn't the landing page for this.
            const newPageScripts = [...pageScripts].filter(x => {
                const scriptSrc = x.getAttribute('src').replaceAll('../', '');
                const isEngineScript = this.engineScripts.includes(scriptSrc);
                let retVal = false;

                if (isEngineScript === false) {
                    const scriptKey = `${reqDocDir}${scriptSrc}`;
                    if (this.extraScriptRegistry.includes(scriptKey) === false) {
                        retVal = true;
                    }
                }
                return retVal;
            });

            newPageScripts.forEach(x => this.loadScript(x, dirBackStep, reqDocDir)); //This will dynamically load scripts

        } else { //add scripts into our extraScriptRegistry
            //Need a quick check here to see if this isn't the landing page for this.
            [...pageScripts].forEach(x => {
                const scriptSrc = x.getAttribute('src').replaceAll('../', '');
                const isEngineScript = this.engineScripts.includes(scriptSrc);
                if (isEngineScript === false) {
                    const scriptKey = `${reqDocDir}${scriptSrc}`;
                    if (this.extraScriptRegistry.includes(scriptKey) === false) {
                        this.extraScriptRegistry.push(scriptKey);
                    }
                }
            });
        }
    },
    extractPageInfo(docObj) {
        const content = docObj.querySelector('#content'); //Need to get this node early to get our directory context
        const reqDocDir = content !== null ? content.dataset.dir : '';
        const pageScripts = docObj.querySelectorAll('script');

        //Dynamically load scripts that are not in the browser's memory
        this.fetchScripts(pageScripts, reqDocDir);

        //Next, onto our page elements
        const headerArea = docObj.querySelector('#selectedBar');
        const selectedTopicBar = headerArea.querySelector('topic-bar');
        const selectedTopicId = selectedTopicBar.dataset.id;
        let selectedTopicLink = selectedTopicBar.getAttribute('href');
        const selectedSubTopicArea = selectedTopicBar.querySelector('div.selSubTopics');
        const selectedSubTopicBars = selectedSubTopicArea.querySelectorAll('sub-topic');
        const selectedSubTopics = [];
        selectedSubTopicBars.forEach(bar => { //can't seem to use map here
            selectedSubTopics.push({
                id: bar.dataset.id,
                href: bar.getAttribute('href'),
                label: bar.innerHTML,
            });
        });
        if (selectedSubTopics.length > 0) {
            selectedTopicLink = selectedSubTopics[selectedSubTopics.length - 1].href;
        }
        const subTopics = [];
        let subTopicBars = [];
        const subMenuArea = selectedTopicBar.querySelector('menu.headerSubNav');
        if (subMenuArea !== null) {
            subTopicBars = subMenuArea.querySelectorAll('sub-topic');
            subTopicBars.forEach(bar => {
                subTopics.push({
                    id: bar.dataset.id,
                    href: bar.getAttribute('href'),
                    selected: bar.getAttribute('selected') || 'false',
                    label: bar.innerHTML,
                });
            });
        }
        const selectedSubTopicId = selectedSubTopics.length > 0 ? selectedSubTopics[selectedSubTopics.length - 1].id : '';
        const selectedSubTopicLink = selectedSubTopics.length > 0 ? selectedSubTopics[selectedSubTopics.length - 1].href : '';

        const pageInfo = {
            headerInfo: {
                id: selectedTopicId,
                href: selectedTopicLink,
                selectedSubTopicId,
                selectedSubTopicLink,
                selectedSubTopicInfo: selectedSubTopics,
                subTopics,
                selectedSubTopicBars,
                subTopicBars,
            },
            content,
        };

        return pageInfo;
    },
};

export default { pageFetcher };