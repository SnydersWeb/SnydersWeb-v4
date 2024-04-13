const subTopicTemplate = document.createElement('template');
subTopicTemplate.setAttribute('id', 'subTopicTemplate');
subTopicTemplate.setAttribute('data-adjusted', 'false');
subTopicTemplate.innerHTML = `
    <style>
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
                background-image: url('interfaceImages/subTopicLeft.svg');
                background-repeat: no-repeat;
            }

            .subTopic.header .subTopicLeft {
                height: 24px;
                background-image: url('interfaceImages/selSubTopicLeft.svg');
            }
        
            .subTopicBody {
                float: left;
                height: 18px;
                width: auto;
                font-family: var(--fonts);
                font-size: 75%;
                font-weight: bold;
                color: var(--color-bar-green);
                padding: 0px 0px 0px 0px;
                background-image: url('interfaceImages/subTopicBody.svg');		
            }

            .subTopic.header .subTopicBody {
                height: 24px;
                font-size: 95%;
                background-image: url('interfaceImages/selSubTopicBody.svg');
            }
        
            .subTopicRight {
                float: left;
                width: 13px;
                height: 18px;
                right: -5px;
                top: 0px;
                background-image: url('interfaceImages/subTopicRight.svg');
                background-repeat: no-repeat;
            }

            .subTopic.header .subTopicRight {
                height: 24px;
                background-image: url('interfaceImages/selSubTopicRight.svg');
            }

        .subTopic.selected {
        }        
            .subTopic.selected .subTopicLeft {
                background-image: url('interfaceImages/subTopicLeftSel.svg');
                background-repeat: no-repeat;
            }
        
            .subTopic.selected .subTopicBody {
                background-image: url('interfaceImages/subTopicBodySel.svg');	
                color: var(--color-sub-bar-link-white);	
            }
            
            .subTopic.selected .subTopicRight {
                background-image: url('interfaceImages/subTopicRightSel.svg');
                background-repeat: no-repeat;
            }
                      

        .subTopic.selected.hover {
        }        
            .subTopic.selected.hover .subTopicLeft {
                background-image: url('interfaceImages/subTopicLeftSelHover.svg');
                background-repeat: no-repeat;
            }
        
            .subTopic.selected.hover .subTopicBody {
                background-image: url('interfaceImages/subTopicBodySelHover.svg');		
            }
            
            .subTopic.selected.hover .subTopicRight {
                background-image: url('interfaceImages/subTopicRightSelHover.svg');
                background-repeat: no-repeat;
            }
                        
        .subTopic.hover {
        }        
            .subTopic.hover .subTopicLeft {
                background-image: url('interfaceImages/subTopicLeftHover.svg');
                background-repeat: no-repeat;
            }
        
            .subTopic.hover .subTopicBody {
                background-image: url('interfaceImages/subTopicBodyHover.svg');		
            }
                        
            .subTopic.hover .subTopicRight {
                background-image: url('interfaceImages/subTopicRightHover.svg');
                background-repeat: no-repeat;
            }
                    
        .subTopic.header.hover {
            height: 24px;
        }
        
            .subTopic.header.hover .subTopicLeft {
                background-image: url('interfaceImages/selSubTopicLeftHover.svg');
            }
        
            .subTopic.header.hover .subTopicBody {
                background-image: url('interfaceImages/selSubTopicBodyHover.svg');	
            }
            
            .subTopic.header.hover .subTopicRight {
                background-image: url('interfaceImages/selSubTopicRightHover.svg');
            }
        
        /* End SubTopic Class Selectors */
    }   
    </style>
    <div class="subTopic">
        <div class="subTopicLeft"></div>
        <div class="subTopicBody"><slot class="subTopicTextSlot"></slot></div>
        <div class="subTopicRight"></div>
    </div>`;