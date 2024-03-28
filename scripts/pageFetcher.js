const pageFetcher = {
    postData(url = "", data = {}) {
        // Default options are marked with *
        return fetch(url, {
                method: "POST", // *GET, POST, PUT, DELETE, etc.
                mode: "no-cors", // no-cors, *cors, same-origin
                cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                redirect: "follow", // manual, *follow, error
                referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                body: data
            })
            // fetch() returns a promise. When we have received a response from the server,
            // the promise's `then()` handler is called with the response.
            .then((response) => {
                // Our handler throws an error if the request did not succeed.
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                return response.text();
            })
            .catch((error) => {
                console.log(`Could not fetch result: ${error}`);
            });   
    },
    getPage(url) {
        // Call `fetch()`, passing in the URL.
        return fetch(url)
            // fetch() returns a promise. When we have received a response from the server,
            // the promise's `then()` handler is called with the response.
            .then((response) => {
                // Our handler throws an error if the request did not succeed.
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                // Otherwise (if the response succeeded), our handler fetches the response
                // as text by calling response.text(), and immediately returns the promise
                // returned by `response.text()`.
                return response.text();
            })
            .then((rawHtml) => {
                return this.parsePageObject(rawHtml);
            })
            .catch((error) => {
                console.log(`Could not fetch page: ${error}`);
            });        
    },
    parsePageObject(rawHtml) {
        const xmlDoc = new DOMParser().parseFromString(rawHtml, 'text/html');

        return this.extractPageInfo(xmlDoc);
    },
    extractPageInfo(docObj) {
        //SnyderD - use some querySelector magic to get the parts
        //We care about what bar is selected, subtopics that are selected, and available sub topics - oh, and page content
        const headerArea = docObj.querySelector(`#selectedBar`);
        const selectedTopicBar = headerArea.querySelector(`TOPIC-BAR`);
        const selectedTopicId = selectedTopicBar.dataset.id;
        let selectedTopicLink = selectedTopicBar.getAttribute(`href`);
        const selectedSubTopicArea = selectedTopicBar.querySelector(`DIV.selSubTopics`);
        const selectedSubTopicBars = selectedSubTopicArea.querySelectorAll(`SUB-TOPIC`);
        const selectedSubTopics = [];
        selectedSubTopicBars.forEach(bar => { //can't seem to use map here
            selectedSubTopics.push({
                id: bar.dataset.id,
                href: bar.getAttribute(`href`),
                label: bar.innerHTML,
            });
        });
        if (selectedSubTopics.length > 0) {
            selectedTopicLink = selectedSubTopics[selectedSubTopics.length - 1].href;
        }
        const subTopics = [];
        let subTopicBars = [];
        const subMenuArea = selectedTopicBar.querySelector(`MENU[role="navigation"]`);
        if (subMenuArea !== null) {
            subTopicBars = subMenuArea.querySelectorAll(`SUB-TOPIC`);
            subTopicBars.forEach(bar => {
                subTopics.push({
                    id: bar.dataset.id,
                    href: bar.getAttribute(`href`),
                    selected: bar.getAttribute(`selected`) || "false",
                    label: bar.innerHTML,
                });
            });
        }
        const content = docObj.querySelector(`#content`);
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
   
