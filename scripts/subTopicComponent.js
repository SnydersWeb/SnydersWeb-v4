// Create a class for the element
class SubTopic extends HTMLElement {
    static observedAttributes = ["isHeader", "selected", "dismissed", "added"]; 
    
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

        this.removeEvent = new CustomEvent(
            "removeSubTopic", 
            {
                detail: {
                    item: this
                }, 
                bubbles: false,
                cancelable: true,
            }
        );

        this.addEvent = new CustomEvent(
            "addSubTopic", 
            {
                detail: {
                    item: this
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

    connectedCallback() {
        this.bar.addEventListener('click', this.handleClick);
        this.bar.addEventListener('keydown', this.handleClick);
        this.bar.addEventListener('mouseover', this.mouseOver);
        this.bar.addEventListener('mouseout', this.mouseOut);
    };

    disconnectedCallback() {
        this.bar.removeEventListener('click', this.handleClick);
        this.bar.removeEventListener('keydown', this.handleClick);
        this.bar.removeEventListener('mouseover', this.mouseOver);
        this.bar.removeEventListener('mouseout', this.mouseOut);
    };
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (/selected/i.test(name)) {
            this.selectBar(newValue);
        } else if (/dismissed/.test(name)) {
            if (/true/i.test(newValue)) {
                this.dismiss();
            }
        } else if (/added/.test(name)) {
            if (/true/i.test(newValue)) {
                this.add();
            }
        }
    };
    
    handleClick = (evt) => {
        const { type } = evt;
        let fireDispatch = false;
        if (/keydown/.test(type)) {
            const { keyCode } = evt;
            if (keyCode === 13) { //Enter
                fireDispatch = true;
            }
        } else {
            fireDispatch = true; //Click
        }
        if (fireDispatch) {
            evt.cancelBubble = true; 
            document.querySelector("#mainContainer").dispatchEvent(this.clickEvent);
        }
    };

    mouseOver = (evt) => {
        evt.currentTarget.classList.add(`hover`);
        evt.cancelBubble = true; //Block this from going to the title bar!
    };

    mouseOut = (evt) => {
        evt.currentTarget.classList.remove(`hover`);
        evt.cancelBubble = true; //Block this from going to the title bar!
    };

    selectBar(select) {
        if (/true/i.test(select)) { //Select && /false/.test(oldValue)
            this.bar.classList.add(`selected`);
            this.bar.setAttribute("selected", "true");

            this.animate([
                {
                    transform: "scale(1)",
                    opacity: 1,
                },
                {
                    transform: "scale(1.5)",
                    opacity: .50,
                },
                
            ], {
                duration: 250,
                easing: "ease-out",
            });
        } else if (/false/i.test(select)) { //De-select
           this.bar.classList.remove(`selected`);
        }
    };

    dismiss() {
        let animate = {};
        let mainContainer = document.querySelector("#mainContainer");
        let { offsetWidth, offsetHeight } = mainContainer;
        if (this.bar.classList.contains('header')) {
            animate = this.animate([
                {
                    transform: `translateX(0px)`,
                    opacity: 1,
                },
                {
                    transform: `translateX(${offsetWidth + (offsetWidth / 4)}px`,
                    opacity: .50,
                },
                
            ], {
                duration: 500,
                easing: "ease-out",
            });
        } else {
            animate = this.animate([
                {
                    transform: `translateY(0px)`,
                    opacity: 1,
                    zIndex: 1,
                },
                {
                    transform: `translateY(${offsetHeight/2}px) rotate(${utils.getRandomInt(-.75, .75, 2)}turn)`,
                    opacity: 0,
                    zIndex: 1,
                },
                
            ], {
                duration: 500,
                easing: "ease-out",
            });
        }
        
        animate.addEventListener("finish", () => { 
            document.querySelector("#selectedBar").dispatchEvent(this.removeEvent);
        });
    };

    add() {
        let animate = {};
        let mainContainer = document.querySelector("#mainContainer");
        let { offsetWidth } = mainContainer;
        if (this.bar.classList.contains('header')) {
            animate = this.animate([
                {
                    transform: `translateX(${offsetWidth + (offsetWidth / 4)}px)`,
                    opacity: 0,
                    position: 'absolute',
                },
                {
                    transform: `translateX(0px)`,
                    opacity: 1,
                    position: 'absolute',
                },
                
            ], {
                duration: 500,
                easing: "ease-in",
            });
        } else {
            animate = this.animate([
                {
                    
                    transform: `translateX(${offsetWidth + (offsetWidth / 4)}px) translateY(0px)`,
                    opacity: 0,
                    position: 'relative',
                },
                {
                    transform: `translateX(0px) translateY(0px)`,
                    opacity: 1,
                },
                
            ], {
                duration: 750,
                easing: "ease-in",
            });
        }
        
        animate.addEventListener("finish", () => { 
            this.bar.removeAttribute("added");
            this.classList.remove("staged");
            document.querySelector("#selectedBar").dispatchEvent(this.addEvent);
        });
    };

  }
  
  customElements.define("sub-topic", SubTopic);