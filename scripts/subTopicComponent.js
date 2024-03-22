// Create a class for the element
class SubTopic extends HTMLElement {
    static observedAttributes = ["href", "isHeader", "selected"]; //this will change as I figure things out!
    
    constructor() {
        // Always call super first in constructor
        self = super();
        //this._internals = this.attachInternals();
        
        this._shadow = this.attachShadow({mode: "open"});
        
        //bit of a brutal hack here for image pathing
        let templateContent = subTopicTemplate.innerHTML;
        const { pathname } = window.location;
        if (/aboutme|websites|portfolio|destinations|contact/gi.test(pathname) === false) {
            templateContent = templateContent.replaceAll("../interfaceImages", "interfaceImages");
            subTopicTemplate.innerHTML = templateContent;
        }

        const templateText = subTopicTemplate.content.cloneNode(true);
        this.shadowRoot.append(templateText);
        this.bar = this.shadowRoot.querySelector(".subTopic");

        this.bar.addEventListener('click', this.handleClick);
        this.bar.addEventListener('mouseover', this.mouseOver);
        this.bar.addEventListener('mouseout', this.mouseOut);

        this.href = this.getAttribute("href");   
        this.isHeader = this.getAttribute("isHeader");
        this.selected = this.getAttribute("selected");
                
        if (/true/i.test(this.isHeader)) {
            this.bar.classList.toggle(`header`);
        }

        if (/true/i.test(this.selected)) {
            this.bar.classList.toggle(`selected`);
        }
        
        this.event = new CustomEvent(
            "fetchPage", 
            {
                detail: {
                    pageURL: this.href
                }, 
                bubbles: false,
                cancelable: true,
            }
        );
    }

    handleClick = (evt) => {
        evt.cancelBubble = true; //Block this from going to the title bar!
        document.querySelector("#mainContainer").dispatchEvent(this.event);
    };

    mouseOver = (evt) => {
        evt.currentTarget.classList.toggle(`hover`);
        evt.cancelBubble = true; //Block this from going to the title bar!
    };

    mouseOut = (evt) => {
        evt.currentTarget.classList.toggle(`hover`);
        evt.cancelBubble = true; //Block this from going to the title bar!
    };

    connectedCallback = () => {
        console.log("Custom element added to page.");
    };
  
    disconnectedCallback = () => {
        console.log("Custom element removed from page.");
    }
  
    adoptedCallback = () => {
        console.log("Custom element moved to new page.");
    }
  
    attributeChangedCallback = (name, oldValue, newValue) => {
        console.log(`Attribute ${name} has changed.`);
        if (oldValue === newValue) { 
            return;
        }
        this[property] = newValue;
    }
  }
  
  customElements.define("sub-topic", SubTopic);