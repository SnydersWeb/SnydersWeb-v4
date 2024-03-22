// Create a class for the element
class TopicBar extends HTMLElement {
    static observedAttributes = ["isHeader"]; 
    
    constructor() {
        // Always call super first in constructor
        self = super();
        
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
        evt.currentTarget.classList.toggle(`hover`);
        evt.cancelBubble = true; //Block this from going to the title bar!
    };

    mouseOut = (evt) => {
        evt.currentTarget.classList.toggle(`hover`);
        evt.cancelBubble = true; //Block this from going to the title bar!
    };

    disconnectedCallback = () => {
        console.log("Custom element removed from page.");
    };
    
    attributeChangedCallback(name, oldValue, newValue) {
        console.log(
            `TopicBar Attribute ${name} has changed from ${oldValue} to ${newValue}.`,
        );
    };
  }
  
  customElements.define("topic-bar", TopicBar);