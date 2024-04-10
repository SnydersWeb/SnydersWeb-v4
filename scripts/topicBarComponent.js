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
        this.subTopics = 0;
        this.locData = null;
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
        this.addEventListener('keydown', this.handleClick);
        this.addEventListener('removeSubTopic', this.removeSubTopic);
        this.bar.classList.remove(`hover`);
        this.bar.addEventListener('click', this.handleClick);
        this.bar.addEventListener('mouseover', this.mouseOver);
        this.bar.addEventListener('mouseout', this.mouseOut);
    };

    disconnectedCallback() {
        this.removeEventListener('keydown', this.handleClick);
        this.removeEventListener('removeSubTopic', this.removeSubTopic);
        this.bar.removeEventListener('click', this.handleClick);
        this.bar.removeEventListener('mouseover', this.mouseOver);
        this.bar.removeEventListener('mouseout', this.mouseOut);
    };
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (/promote/.test(name)) {
            if (/null/i.test(newValue) === false) {
                this.locData = JSON.parse(newValue);
                this.promote();
            }
        } else if (/return/.test(name)) {
            if (/null/i.test(newValue) === false) {
                this.locData = JSON.parse(newValue);
                this.cleanBar();
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

    removeSubTopic = (evt) => {
        const { item } = evt.detail;
        const { parentNode:pn } = item; //get our parent

        if (/li/i.test(pn.tagName)) {
            const { parentNode:menu } = pn;
            menu.removeChild(pn); 
        } else if (pn.classList.contains("selSubTopics")) {
            pn.removeChild(item); 
        }

        //Check to see if we're in a return state
        const isReturn = this.getAttribute("return");
        if (/null/.test(isReturn) === false) {
            this.subTopicRemoved();
        }
    };

    promote = () => {
        const { home, promoted } = this.locData;
        const homeWidth = home.width > 0 ? home.width : 180; //180 is the min-width
        const homeXPos = home.y < this.mobileYThreshold ? home.x : 0 - promoted.x;
        const homeYPos = home.y < this.mobileYThreshold ? 10 - promoted.y : home.y;
        
        const steps = [
            {
                transform: `translateX(${homeXPos}px) translateY(${homeYPos}px)`,
                width: `${homeWidth}px`,
                position: 'absolute',
                zIndex: 5,
            },
            {
                transform: `translateX(-${promoted.x}px) translateY(${0}px)`,
                width: `${promoted.width/2}px`,
            },
            {
                transform: `translateX(0px) translateY(0px)`,
                width: `${promoted.width}px`,
                position: 'relative',
                zIndex: 1,
            },            
        ];

        //Mobile doesn't get all 3 steps
        if (home.y < this.mobileYThreshold) {
            steps.splice(1, 1);
        }
        
        const animate = this.animate(steps, {
            duration: 1000,
            easing: "ease-in-out",
        });
        
        animate.addEventListener("finish", () => { 
            this.locData = null;
            this.removeAttribute("promote");
        });
    };

    cleanBar = () => {
        const { home, promoted } = this.locData;

        const homeYPos = promoted.y - home.y;       
        const homeXPos = home.y < this.mobileYThreshold ? promoted.x - home.x : promoted.x - 3;       
        this.style.transform = `translateX(${homeXPos}px) translateY(${homeYPos}px)`;
        this.style.width = `${promoted.width}px`;

        //Unhide our stuff so we can see the animation
        const subNavMenu = this.querySelector(`MENU.headerSubNav`);
        subNavMenu.style.display = "inline-block";
        subNavMenu.width = `${promoted.width}px`;

        //Dismiss all submenu items since it's magically appearing at the top
        const oldSubTopicItems = this.querySelectorAll(`SUB-TOPIC`);
        this.subTopics = oldSubTopicItems.length;
        if (oldSubTopicItems.length > 0) {            
            oldSubTopicItems.forEach(subTopic => {
                subTopic.setAttribute("dismissed", "true");
            });
        } else if (oldSubTopicItems.length === 0) {
            this.return();
        }
    };

    subTopicRemoved = () => {
        this.subTopics -=1; 

        if (this.subTopics === 0) {
            this.return(true);
        }
    };

    return = (fast = false) => {
        const { home, promoted } = this.locData;        
        const homeWidth = home.width > 0 ? home.width : 180; //180 is the min-width
        const homeYPos = home.y < this.mobileYThreshold ? promoted.y - home.y : 5 - home.y;       
        const promotedXPos = home.y < this.mobileYThreshold ? promoted.x - home.x : promoted.x - 3; 

        
        this.style.transform = ``;
        this.style.width = ``;
        const subNavMenu = this.querySelector(`MENU.headerSubNav`);
        subNavMenu.width = ``;

        let steps = [
            {
                transform: `translateX(${promotedXPos}px) translateY(${homeYPos}px)`,
                width: `${promoted.width}px`,
            },
            {
                transform: `translateX(${promotedXPos}px) translateY(${0}px)`,
                width: `${promoted.width/2}px`,
            },
            {
                transform: `translateX(0px) translateY(0px)`,
                width: `${homeWidth}px`,
            },
            
        ];

        //Mobile doesn't get all 3 steps
        if (home.y < this.mobileYThreshold) {
            steps = [
                {
                    transform: `translateX(${promotedXPos}px) translateY(${homeYPos}px)`,
                    width: `${promoted.width}px`,
                },
                {
                    transform: `translateX(${promotedXPos}px) translateY(${homeYPos}px)`,
                    width: `${homeWidth}px`,
                },
                {
                    transform: `translateX(0px) translateY(0px)`,
                    width: `${homeWidth}px`,
                },
                
            ];
        }
        
        const animate = this.animate(steps, {
            duration: fast ? 750 : 1000,
            easing: "ease-in-out",
        });

        animate.addEventListener("finish", () => { 
            this.locData = null;
            this.removeAttribute("return");  
            this.removeEventListener('removeSubTopic', this.subTopicRemoved);
        });
    };


  }
  
  customElements.define("topic-bar", TopicBar);