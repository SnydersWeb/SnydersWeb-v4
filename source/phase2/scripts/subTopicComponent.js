

const subTopicTemplate = document.createElement('template');
subTopicTemplate.innerHTML = `
    <style>
    /* Vars */
    :root {
        --fonts: Roboto, arial, sans-serif;
        --color-link-green: #49EC2D;
        --color-bar-green: #8EF000;
        --color-link-hover: #FFFF00;
        --color-bar-color: #51606E;
        --color-sel-bar-color: #6E5F51;
    }
    :host {
        display: block;
    }
    :host SLOT {
        display: block;
    }
    ::slotted(SUB-TOPIC) {
        float: left;
    }
    
    @media screen {        
        /* Begin SubItem Class Selectors */
        .subTopic {
            padding: 0px;
            margin: 0px;
            height: 18px;
            width: auto;
            white-space: nowrap;
            float: left;
            clear: none;
            table-layout: fixed;	
        }

        .subTopic.header {
            height: 24px;
        }

        .subTopic.header > .subTopic.header {
            margin-left: -9px;
            font-size: 70%;
        }

            .subTopicLeft {
                float: left;
                width: 13px;
                height: 18px;
                left: -5px;
                top: 0px;
                background-image: url('./interfaceImages/subTopicLeft.svg');
                background-repeat: no-repeat;
            }

            .subTopic.header .subTopicLeft {
                height: 24px;
                background-image: url('./interfaceImages/selSubTopicLeft.svg');
            }
        
            .subTopicBody {
                float: left;
                height: 18px;
                width: auto;
                font-family: var(--fonts);
                font-size: 70%;
                font-weight: bold;
                color: var(--color-bar-green);
                line-height: 1.45em;
                padding: 0px 0px 0px 0px;
                background-image: url('./interfaceImages/subTopicBody.svg');		
            }

            .subTopic.header .subTopicBody {
                height: 24px;
                font-size: 95%;
                background-image: url('./interfaceImages/selSubTopicBody.svg');
            }
                    
            .subTopicBody A:link, .subTopicBody A:visited {
                color: var(--color-bar-green);
                text-decoration: none;
            }			
            
            .subTopicBody A:hover, .subTopicBody A:active {
                color: #FFFFFF;
                text-decoration: none;
            }		
        
            .subTopicRight {
                float: left;
                width: 13px;
                height: 18px;
                right: -5px;
                top: 0px;
                background-image: url('./interfaceImages/subTopicRight.svg');
                background-repeat: no-repeat;
            }

            .subTopic.header .subTopicRight {
                height: 24px;
                background-image: url('./interfaceImages/selSubTopicRight.svg');
            }
                    
        .subTopic.hover {
        }        
            .subTopic.hover .subTopicLeft {
                background-image: url('./interfaceImages/subTopicLeftSel.svg');
                background-repeat: no-repeat;
            }
        
            .subTopic.hover .subTopicBody {
                background-image: url('./interfaceImages/subTopicBodySel.svg');		
            }
            
            .subTopic.hover .subTopicBody A:link, .subTopic:hover .subTopicBody A:visited {
                color: var(--color-bar-green);
                text-decoration: none;
            }			
            
            .subTopic.hover .subTopicRight {
                background-image: url('./interfaceImages/subTopicRightSel.svg');
                background-repeat: no-repeat;
            }
                    
        .subTopic.header.hover {
            height: 24px;
        }
        
            .subTopic.header.hover .subTopicLeft {
                background-image: url('./interfaceImages/selSubTopicLeftSel.svg');
            }
        
            .subTopic.header.hover .subTopicBody {
                background-image: url('./interfaceImages/selSubTopicBodySel.svg');	
            }
            
            .subTopic.header.hover .subTopicRight {
                background-image: url('./interfaceImages/selSubTopicRightSel.svg');
            }
        
            
        /* End SubItem Class Selectors */		            
    }    
        
    @media print {         
        /* Begin SubTopic Class Selectors */
        .subTopic {
            position : relative;
            float : left;
            margin : 0px 5px 0px 5px;
        }
        
            .subTopicLeft {
                display : none;
                visibility : hidden;
            }
        
            .subTopicBody {
                position : relative;
                top : 45px;
                white-space : nowrap;
                font-family : var(--fonts);
                font-weight : bold;
                font-size : 12pt;
                color : #000000;
            }
            
            .subTopicBody A:link, .subTopicBody A:visited {
                color : #000000;
                text-decoration : none;
            }			
            
            .subTopicBody A:hover, .subTopicBody A:active {
                color : #000000;
                text-decoration : none;
            }		
        
            .subTopicRight {
                display : none;
                visibility : hidden;
            }

        /* End SubTopic Class Selectors */
    }   

    </style>
    <div class="subTopic">
        <div class="subTopicLeft"></div>
        <div class="subTopicBody"><slot class="subTopicTextSlot"></slot></div>
        <div class="subTopicRight"></div>
    </div>`;
    
// Create a class for the element
class SubTopic extends HTMLElement {
    static observedAttributes = ["href", "isHeader"]; //this will change as I figure things out!
    
    constructor() {
        // Always call super first in constructor
        self = super();
        //this._internals = this.attachInternals();
        
        this._shadow = this.attachShadow({mode: "open"});
        const templateText = subTopicTemplate.content.cloneNode(true);
        this.shadowRoot.append(templateText);
        this.bar = this.shadowRoot.querySelector(".subTopic");

        this.bar.addEventListener('click', this.handleClick);
        this.bar.addEventListener('mouseover', this.mouseOver);
        this.bar.addEventListener('mouseout', this.mouseOut);

        this.href = this.getAttribute("href");   
        this.isHeader = this.getAttribute("isHeader");
                
        if (/true/i.test(this.isHeader)) {
            this.bar.className = `${this.bar.className} header`;
        }
    }

    handleClick = (evt) => {
        console.log(`Going to: ${this.href}`);        
        evt.cancelBubble = true; //Block this from going to the title bar!
    };

    mouseOver = (evt) => {
        evt.currentTarget.className = `${evt.currentTarget.className} hover`;
        evt.cancelBubble = true; //Block this from going to the title bar!
    };

    mouseOut = (evt) => {
        evt.currentTarget.className = evt.currentTarget.className.replace("hover", "");
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