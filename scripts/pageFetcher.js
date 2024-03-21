class PageFetcher {
    constructor() {
        
    }
   
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
            // When response.text() has succeeded, the `then()` handler is called with
            // the text, and we copy it into the `poemDisplay` box.
            .then((rawHtml) => {
                return this.parsePageObject(rawHtml);
            })
            // Catch any errors that might happen, and display a message
            // in the `poemDisplay` box.
            .catch((error) => {
                console.log(`Could not fetch verse: ${error}`);
            });        
    }

    parsePageObject(rawHtml) {
        const xmlDoc = new DOMParser().parseFromString(rawHtml, 'text/html');

        return this.extractPageInfo(xmlDoc);
    }

    extractPageInfo(docObj) {
        //SnyderD - use some querySelector magic to get the parts
        //We care about what bar is selected, subtopics that are selected, and available sub topics - oh, and page content
        const headerArea = docObj.querySelector(`#selectedBar`);
        const selectedTopicBar = headerArea.querySelector(`TOPIC-BAR`);
        const selectedTopicId = selectedTopicBar.getAttribute(`data-id`);
        const selectedTopicLink = selectedTopicBar.getAttribute(`href`);        
        const selectedSubTopicArea = selectedTopicBar.querySelector(`DIV.selSubTopics`);
        const selectedSubTopicBars = selectedSubTopicArea.querySelectorAll(`SUB-TOPIC`);
        const selectedSubTopics = [];
        selectedSubTopicBars.forEach(bar => { //can't seem to use map here
            selectedSubTopics.push({
               id: bar.getAttribute(`data-id`),
               href: bar.getAttribute(`href`),
            });
        });
        const subMenuArea = selectedTopicBar.querySelector(`MENU[role="navigation"]`);
        const subTopicBars = subMenuArea.querySelectorAll(`SUB-TOPIC`);
        const subTopics = [];
        subTopicBars.forEach(bar => {
            subTopics.push({
               id: bar.getAttribute(`data-id`),
               href: bar.getAttribute(`href`),
               selected: bar.getAttribute(`selected`) || "false",
            });
        });
        const contentArea = docObj.querySelector(`#content`);
        const pageContent = contentArea.innerHTML;
        
        const pageInfo = {
            headerInfo: {
                id: selectedTopicId,
                href: selectedTopicLink,
                selectedSubTopicInfo: selectedSubTopics,
                subTopics: subTopics
            },
            content: pageContent,
        };
        
        return pageInfo;
    }
}