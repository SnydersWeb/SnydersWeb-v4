// Create a class for the element
class TopicBar extends HTMLElement {
    static observedAttributes = ["isHeader"]; 
    
    constructor() {
        // Always call super first in constructor
        self = super();
        
        this._shadow = this.attachShadow({mode: "open"});

        //Template is called multiple times - but to ensure it's only changed 1x we set
        //a data attribute to make sure it's only fixed 1x since it's a GLOBAL
        if (/false/i.test(topicBarTemplate.dataset.adjusted)) {
            this.adjustTemplatesForPath();
            topicBarTemplate.dataset.adjusted = true;
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

    adjustTemplatesForPath() {
        //Fix our templates for current path
        //bit of a brutal hack here for image pathing
        const pageContent = document.querySelector("#content");
        const currentDirectory = pageContent.dataset.dir.slice(0,-1);
        if (currentDirectory !== "") {
            const pathPrepend = currentDirectory.split("/").map(() => {
                return "../";
            }).join("");
            
            //Fix our templates!
            let templateContent = topicBarTemplate.innerHTML;
            templateContent = templateContent.replaceAll("interfaceImages", `${pathPrepend}interfaceImages`);
            topicBarTemplate.innerHTML = templateContent;
        }
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