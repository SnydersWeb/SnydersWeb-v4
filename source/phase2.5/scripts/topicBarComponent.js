// Create a class for the element
class TopicBar extends HTMLElement {
    static observedAttributes = ["href", "isHeader"]; //this will change as I figure things out!
    
    constructor() {
        // Always call super first in constructor
        self = super();
        //this._internals = this.attachInternals();
        
        this._shadow = this.attachShadow({mode: "open"});

        //bit of a brutal hack here for image pathing
        let templateContent = topicBarTemplate.innerHTML;
        const { pathname } = window.location;
        if (/aboutme|websites|portfolio|destinations|contact/gi.test(pathname) === false) {
            templateContent = templateContent.replaceAll("../interfaceImages", "interfaceImages");
            topicBarTemplate.innerHTML = templateContent;
        }

        const templateText = topicBarTemplate.content.cloneNode(true);
        this.shadowRoot.append(templateText);
        this.bar = this.shadowRoot.querySelector(".topicBar");

        this.bar.addEventListener('click', this.handleClick);
        this.bar.addEventListener('mouseover', this.mouseOver);
        this.bar.addEventListener('mouseout', this.mouseOut);

        this.href = this.getAttribute("href");
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
        evt.cancelBubble = true; 
        document.querySelector("#mainContainer").dispatchEvent(this.event);
    };

    mouseOver = (evt) => {
        evt.currentTarget.className = `${evt.currentTarget.className} hover`;
        evt.cancelBubble = true; 
    };

    mouseOut = (evt) => {
        evt.currentTarget.className = evt.currentTarget.className.replace(" hover", "");
        evt.cancelBubble = true; 
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
  
  customElements.define("topic-bar", TopicBar);