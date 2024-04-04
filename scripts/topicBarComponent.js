// Create a class for the element
class TopicBar extends HTMLElement {
    static observedAttributes = ["isHeader", "promote", "return"]; 
    
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

        this.href = this.getAttribute("href");
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

        this.mobileYThreshold = 90;
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

    connectedCallback() {
        // console.log("Custom element added to page.");
        this.bar.classList.remove(`hover`);
        this.bar.addEventListener('click', this.handleClick);
        this.addEventListener('keydown', this.handleClick);
        this.bar.addEventListener('mouseover', this.mouseOver);
        this.bar.addEventListener('mouseout', this.mouseOut);
    };

    disconnectedCallback() {
        this.bar.removeEventListener('click', this.handleClick);
        this.removeEventListener('keydown', this.handleClick);
        this.bar.removeEventListener('mouseover', this.mouseOver);
        this.bar.removeEventListener('mouseout', this.mouseOut);
    };
    
    attributeChangedCallback(name, oldValue, newValue) {
        //console.log(`attribute: ${name} ${oldValue} ${newValue}`);
        if (/promote/.test(name)) {
            if (/null/i.test(newValue) === false) {
                this.promote(newValue);
            }
        } else if (/return/.test(name)) {
            if (/null/i.test(newValue) === false) {
                this.return(newValue);
            }
        }
    };

    handleClick = (evt) => {
        const { type, target } = evt;
        let fireDispatch = false;
        if (/sub-topic/i.test(target.tagName)) {
            target.handleClick(evt); //pass the event down
            return; //Stop it from eating sub bar events when at the top!
        }
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

    promote = (rawLocData) => {
        const locData = JSON.parse(rawLocData);
        
        const homeWidth = locData.home.width > 0 ? locData.home.width : 180; //180 is the min-width
        const homeXPos = locData.home.y < this.mobileYThreshold ? locData.home.x : 0 - locData.promoted.x;
        const homeYPos = locData.home.y < this.mobileYThreshold ? 10 - locData.promoted.y : locData.home.y;
        
        const steps = [
            {
                transform: `translateX(${homeXPos}px) translateY(${homeYPos}px)`,
                width: `${homeWidth}px`,
                position: 'absolute',
                zIndex: 5,
            },
            {
                transform: `translateX(-${locData.promoted.x}px) translateY(${0}px)`,
                width: `${locData.promoted.width/2}px`,
            },
            {
                transform: `translateX(0px) translateY(0px)`,
                width: `${locData.promoted.width}px`,
                position: 'relative',
                zIndex: 1,
            },            
        ];

        //Mobile doesn't get all 3 steps
        if (locData.home.y < this.mobileYThreshold) {
            steps.splice(1, 1);
        }
        
        const animate = this.animate(steps, {
            duration: 1000,
            easing: "ease-in-out",
        });
        
        animate.addEventListener("finish", () => { 
            this.removeAttribute("promote");
        });
    };

    return = (rawLocData) => {
        const locData = JSON.parse(rawLocData);
        const homeWidth = locData.home.width > 0 ? locData.home.width : 180; //180 is the min-width
        const homeYPos = locData.home.y < this.mobileYThreshold ? locData.promoted.y : 0 - locData.home.y;
        
        const steps = [
            {
                transform: `translateX(${locData.promoted.x}px) translateY(${homeYPos}px)`,
                width: `${locData.promoted.width}px`,
            },
            {
                transform: `translateX(${locData.promoted.x}px) translateY(${0}px)`,
                width: `${locData.promoted.width/2}px`,
            },
            {
                transform: `translateX(0px) translateY(0px)`,
                width: `${homeWidth}px`,
            },
            
        ];

        //Mobile doesn't get all 3 steps
        if (locData.home.y < this.mobileYThreshold) {
            steps.splice(1, 1);
        }
        
        const animate = this.animate(steps, {
            duration: 1000,
            easing: "ease-in-out",
        });

        animate.addEventListener("finish", () => { 
            this.removeAttribute("return");
        });
    };
  }
  
  customElements.define("topic-bar", TopicBar);