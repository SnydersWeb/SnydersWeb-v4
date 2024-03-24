// Create a class for the element
class SubTopic extends HTMLElement {
    static observedAttributes = ["isHeader", "selected"]; 
    
    constructor() {
        // Always call super first in constructor
        self = super();
        
        this._shadow = this.attachShadow({mode: "open"});
        
        //Template is called multiple times - but to ensure it's only changed 1x we set
        //a data attribute to make sure it's only fixed 1x since it's a GLOBAL
        if (/false/i.test(subTopicTemplate.dataset.adjusted)) {
            this.adjustTemplatesForPath();
            subTopicTemplate.dataset.adjusted = true;
        }
        
        const templateText = subTopicTemplate.content.cloneNode(true);
        this.shadowRoot.append(templateText);
        this.bar = this.shadowRoot.querySelector(".subTopic");

        this.bar.addEventListener('click', this.handleClick);
        this.bar.addEventListener('mouseover', this.mouseOver);
        this.bar.addEventListener('mouseout', this.mouseOut);

        this.href = this.getAttribute("href");   
        this.isHeader = this.getAttribute("isHeader");
        this.selected = this.getAttribute("selected") || "false";
                
        if (/true/i.test(this.isHeader)) {
            this.bar.classList.toggle(`header`);
        }

        if (/true/i.test(this.selected)) {
            this.bar.classList.toggle(`selected`);
        }
        
        this.clickEvent = new CustomEvent(
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
            let templateContent = subTopicTemplate.innerHTML;
            templateContent = templateContent.replaceAll("interfaceImages", `${pathPrepend}interfaceImages`);
            subTopicTemplate.innerHTML = templateContent;
        }
    }

    handleClick = (evt) => {
        evt.cancelBubble = true; //Block this from going to the title bar!
        document.querySelector("#mainContainer").dispatchEvent(this.clickEvent);
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
    
    selectBar(select) {
        if (/true/i.test(select)) { //Select && /false/.test(oldValue)
            const animate = this.bar.animate([
                {
                    transform: "scale(1)",
                    opacity: 1,
                },
                {
                    transform: "scale(1.5)",
                    opacity: .50,
                },
                
            ], {
                duration: 500,
                easing: "ease-out",
            });
            animate.addEventListener("finish", () => { 
                this.bar.classList.add(`selected`);
                this.bar.setAttribute("selected", "true");
            })
        }
        if (/false/i.test(select)) { //De-select
           this.bar.classList.remove(`selected`);
        }
    };

    attributeChangedCallback(name, oldValue, newValue) {
        if (/selected/i.test(name)) {
            this.selectBar(newValue);
        }
    };
  }
  
  customElements.define("sub-topic", SubTopic);