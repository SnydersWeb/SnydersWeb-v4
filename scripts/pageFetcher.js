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
        const xmlDoc = new DOMParser().parseFromString(rawHtml, 'application/xml');

        //SnyderD - use some XPath magic and break this up into what we need

        return xmlDoc;

    }
}