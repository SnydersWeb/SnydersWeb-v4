// Create a class for the element
class SubTopic extends HTMLElement {
    static observedAttributes = ["isHeader", "selected"]; 
    
    constructor() {
        // Always call super first in constructor
        self = super();
        
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
                    opacity: 0.5,
                },
                {
                    transform: "scale(1)",
                    opacity: 1,
                }
            ], {
                duration: 500,
                easing: "ease-in-out",
            });
            animate.addEventListener("finish", () => { 
                this.bar.classList.add(`selected`);
                this.bar.setAttribute("selected", "true");
            })
        }
        if (/false/i.test(select)) { //De-select
            const animate = this.bar.animate([
                {
                    transform: "scale(1)",
                    opacity: 1,
                },
                {
                    transform: "scale(.5)",
                    opacity: 0.5,
                },
                {
                    transform: "scale(1)",
                    opacity: 1,
                }
            ], {
                duration: 500,
                easing: "ease-in-out",
            });                
            animate.addEventListener("finish", () => { 
                this.bar.classList.remove(`selected`);
                this.bar.setAttribute("selected", "false");
            })
        }
    };

    attributeChangedCallback(name, oldValue, newValue) {
        if (/selected/i.test(name)) {
            this.selectBar(newValue);
        }
    };
  }
  
  customElements.define("sub-topic", SubTopic);