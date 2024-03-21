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
        window.location.href = pageURL;

        //this.requestedPageInfo = await this.pageFetcher.getPage(pageURL);
        //this.handlePageChanges();        
    }

    handlePageChanges() {
        console.dir(this.currentPageInfo);
        console.dir(this.requestedPageInfo);
    }
}

const pageMaestro = new Maestro();
pageMaestro.init();