

const topicBarTemplate = document.createElement('template');
topicBarTemplate.innerHTML = `
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
    ::slotted(.barTextSlot) {
        float: left;
    }
    ::slotted(.selSubTopics) {
        position: relative;
        z-index: 20;
    }
    ::slotted(.subTopics) {
        position: relative;
        left: 70px;
        top: 2px;
        right: 5px;
        height: 24px;
        z-index: 10;
    }

    @media screen {
        .topicBar {
            position: relative;
            z-index: 1;
        }
            .topicBarTop {
                position: relative;
                width: 100%;
            }
                .topicBarTop .topicBarTopLeft {
                    position: absolute;
                    height: 13px;
                    width: 13px;
                    left: 0px;
                    top: 0px;
                    background-image: url('interfaceImages/barLeftTop.svg');
                    background-repeat: no-repeat;
                }
            
                .topicBarTop .topicBarTopMiddle {
                    position: relative;
                    left: 0px;
                    height: 2px;
                    width: auto;
                    margin-left: 13px;
                    margin-right: 10px;
                    background-color: var(--color-bar-color);
                }
            
                .topicBarTop .topicBarTopRight {
                    position: absolute;
                    height: 10px;
                    width: 10px;
                    right: 0px;
                    top: 0px;
                    background-image: url('interfaceImages/barRightTop.svg');
                    background-repeat: no-repeat;
                }
                        
            .topicBarBody {
                position: relative;
                width: 100%;
                height: 1.5em;
            }
        
                .topicBarBody .topicBarBodyLeft {
                    position: absolute;
                    width: 13px;
                    height: .8em;
                    left: 0px;
                    top: 11px;
                    background-image: url('interfaceImages/barBody.svg');
                    border-left: 2px solid var(--color-bar-color);
                }
            
                .topicBarBody .topicBarBodyMiddle {
                    position: relative;
                    left: 0px;
                    width: auto;
                    height: 1.5em;
                    margin-left: 13px;
                    margin-right: 10px;
                    background-image: url('interfaceImages/barBody.svg');
                }
        
                    .topicBarBody .topicBarBodyMiddle .barText {
                        position: relative;
                        font-family: var(--fonts);
                        font-size: 100%;
                        font-weight: bold;
                        color: var(--color-bar-green);
                        line-height: 1.45em;
                        float: left;
                        padding-right: 5px;
                    }			
                
                    .topicBarBody .topicBarBodyMiddle .barText A:link, .topicBarBody .topicBarBodyMiddle .barText A:visited {
                        color: var(--color-bar-green);
                        text-decoration: none;
                    }			
        
                    .topicBarBody .topicBarBodyMiddle .barText {
                        position: relative;
                        font-family: var(--fonts);
                        font-size: 100%;
                        font-weight: bold;
                        color: var(--color-bar-green);
                        line-height: 1.45em;
                        float: left;
                        padding-right: 5px;
                    }			
                    
                .topicBarBody .topicBarBodyRight {
                    position: absolute;
                    width: 9px;
                    height: .50em;
                    right: 0px;
                    top: 8px;
                    background-image: url('interfaceImages/barBody.svg');
                    border-right: 2px solid var(--color-bar-color);
                }
                    
            .topicBarBottom {
                position: relative;
                width: 100%;
            }
            
                .topicBarBottom .topicBarBottomLeft {
                    position: absolute;
                    left: 0px;
                    top: 0px;
                    height: 16px;
                    width: 14px;
                    background-image: url('interfaceImages/barLeftBot.svg');
                    background-repeat: no-repeat;
                }
        
                .topicBarBottom .drop {
                    position: absolute;
                    left: 14px;
                    top: 0px;
                    height: 14px;
                    width: 60px;
                    background-image: url('interfaceImages/barBody.svg');
                }
                
                .topicBarBottom .dropBottom {
                    position: absolute;
                    left: 14px;
                    top: 14px;
                    height: 2px;
                    width: 60px;
                    background-color: var(--color-bar-color);
                }
        
                .topicBarBottom .dropTrans {
                    position: absolute;
                    left: 74px;
                    top: 0px;
                    height: 16px;
                    width: 14px;
                    background-image: url('interfaceImages/barBotDropRight.svg');
                    background-repeat: no-repeat;
                }
                                    
                .topicBarBottom .subMenuArea {
                    position: relative;
                    left: 0px;
                    width: auto;
                    height: 28px;
                    margin-left: 87px;
                    margin-right: 10px;
                    border-top: 3px solid var(--color-bar-color);
                }
        
                    .topicBarBottom .subMenuArea MENU {
                        margin: 0px 0px 0px -10px;
                        width: 100%;
                        float: left;
                    }
                        .topicBarBottom .subMenuArea MENU LI {
                            margin: 2px 0px 0px 0px;
                            float: left;
                        }
                        .topicBarBottom .subMenuArea MENU LI + LI {
                            margin: 2px 0px 0px -8px;
                        }
            
                .topicBarBottom .topicBarBottomRight {
                    position: absolute;
                    width: 10px;
                    height: 10px;
                    right: 0px;
                    top: -8px;
                    background-image: url('interfaceImages/barRightBot.svg');
                    background-repeat: no-repeat;
                }

        /* Begin hover selectors for topicBar */
        .topicBar.hover {
        }
        
            .topicBar.hover .topicBarTop {
            }
        
                .topicBar.hover .topicBarTop .topicBarTopLeft {
                    background-image: url('interfaceImages/barLeftTopSel.svg');
                }
            
                .topicBar.hover .topicBarTop .topicBarTopMiddle {
                    background-color: var(--color-sel-bar-color);
                }
            
                .topicBar.hover .topicBarTop .topicBarTopRight {
                    background-image: url('interfaceImages/barRightTopSel.svg');
                }
                        
            .topicBar.hover .topicBarBody {
            }
        
                .topicBar.hover .topicBarBody .topicBarBodyLeft {
                    background-image: url('interfaceImages/barBodySel.svg');
                    border-left: 2px solid var(--color-sel-bar-color);
                }
            
                .topicBar.hover .topicBarBody .topicBarBodyMiddle {
                    background-image: url('interfaceImages/barBodySel.svg');
                }
        
                    .topicBar.hover .topicBarBody .topicBarBodyMiddle .barText {
                        color: #FFFFFF;
                    }			
                
                .topicBar.hover .topicBarBody .topicBarBodyRight {
                    background-image: url('interfaceImages/barBodySel.svg');
                    border-right: 2px solid var(--color-sel-bar-color);;
                }
                    
            .topicBar.hover .topicBarBottom {
            }
            
                .topicBar.hover .topicBarBottom .topicBarBottomLeft {
                    background-image: url('interfaceImages/barLeftBotSel.svg');
                }
        
                .topicBar.hover .topicBarBottom .drop {
                    background-image: url('interfaceImages/barBodySel.svg');
                }
                
                .topicBar.hover .topicBarBottom .dropBottom {
                    background-color: var(--color-sel-bar-color);
                }
        
                .topicBar.hover .topicBarBottom .dropTrans {
                    background-image: url('interfaceImages/barBotDropRightSel.svg');
                }
                                    
                .topicBar.hover .topicBarBottom .extender {
                    background-color: var(--color-sel-bar-color);
                }
            
                .topicBar.hover .topicBarBottom .topicBarBottomRight {
                    background-image: url('interfaceImages/barRightBotSel.svg');
                }			
        /* End hover selectors for topicBar */                
    }    
        
    @media print {         
        /* Begin Topic Bar Class Selctors */
        .topicBar {
            position : relative;
            float : left;
            top : 45px;
        }
        
            .topicBarTop {
                display : none;
                visibility : hidden;
            }
                        
            .topicBarBody .topicBarBodyLeft {
                display : none;
                visibility : hidden;
            }

            .topicBarBody .topicBarBodyMiddle {
                position : relative;
                float : left;
            }		

            .topicBarBody .topicBarBodyMiddle .barText {
                position : relative;
                float: left;
                font-family : var(--fonts);
                font-weight : bold;
                font-size : 12pt;
                color : #000000;
                float : left;
            }		

            .topicBarBody .topicBarBodyRight {
                display : none;
                visibility : hidden;
            }
                
        .topicBarBottom {
            display : none;
            visibility : hidden;
        }
    }
    

    
    /* End Topic Bar Class Selctors */
    </style>
    <div class="topicBar">
        <div class="topicBarTop">
            <div class="topicBarTopLeft"></div>
            <div class="topicBarTopMiddle"></div>
            <div class="topicBarTopRight"></div>
        </div>
        <div class="topicBarBody">
            <div class="topicBarBodyLeft"></div>
            <div class="topicBarBodyMiddle">
                <div class="barText"><slot class="barTextSlot"></slot></div>
                <div class="selSubTopicArea">
                    <slot name="selectedSubTopic" class="selSubTopics"></slot>
                </div>
            </div>
            <div class="topicBarBodyRight"></div>
        </div>
        <div class="topicBarBottom">
            <div class="topicBarBottomLeft"></div>
            <div class="drop"></div>
            <div class="dropBottom"></div>
            <div class="dropTrans"></div>
            <div class="subMenuArea">
                <slot name="subTopics" class="subTopics"></slot>
            </div>
            <div class="topicBarBottomRight"></div>
        </div>
    </div>`;
    
// Create a class for the element
class TopicBar extends HTMLElement {
    static observedAttributes = ["href", "isHeader"]; //this will change as I figure things out!
    
    constructor() {
        // Always call super first in constructor
        self = super();
        //this._internals = this.attachInternals();
        
        this._shadow = this.attachShadow({mode: "open"});
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