const bootSequence = {
    setHandles(handles) {
        const { innerWidth, innerHeight } = window;
        
        //just copy them into here
        for (let item in handles)
		{
            this[item] = handles[item];
        }
        this.logoSVG = this.logo.querySelector("IMG");
        this.isMobile = false;

        const unselectedBarArea = this.unselectedBarArea.getBoundingClientRect();

        let pageHeaderStart = `translateY(-${this.pageHeader.offsetHeight + 20}px)`;
        let unselectedBarStart = `translateX(-${this.unselectedBarArea.offsetWidth}px)`;
        let contentPanelStart = `translateY(${this.contentPanel.offsetHeight + 20}px)`;

        if (unselectedBarArea.y < 10) { //Likely mobile view so our transforms are a bit differnt
            this.isMobile = true;
            pageHeaderStart = `translateY(-${this.pageHeader.offsetHeight * 3}px)`;
            unselectedBarStart = `translateX(-${this.unselectedBarArea.offsetHeight}px)`;
            contentPanelStart = `translateX(${this.contentPanel.offsetWidth + 20}px)`;
        }

        //setup our intitial states
        this.backgroundBackLayerXformStart = `translateX(-${innerWidth + innerWidth/3}px) translateY(0px)`;
        this.backgroundFrontLayerXformStart = `translateX(${innerWidth + innerWidth/3}px) translateY(0px)`;
        this.logoXformStart = `translateX(${(innerWidth/2) - (this.logo.offsetWidth/2)}px) translateY(${(innerHeight/2) - (this.logo.offsetHeight/2)}px) rotate(1turn)`;
        this.logoSVGXformStart = `scale(50)`;
        this.pageHeaderXformStart = pageHeaderStart;
        this.unselectedBarAreaXformStart = unselectedBarStart;
        this.contentPanelXformStart = contentPanelStart;

        this.animations = 0;
        this.finalizeBoot = new CustomEvent(
            "finalizeBoot", 
            {
                detail: {}, 
                bubbles: false,
                cancelable: true,
            }
        );
    },
    start(stageCover) {
        //Stage it!
        this.stageAll();

        //Start it!
        this.fadeBackgroundsIn(stageCover);
    },
    stageAll() {        
        this.backgroundBackLayer.style.transform = this.backgroundBackLayerXformStart;
        this.backgroundBackLayer.style.opacity = 0;
        this.backgroundFrontLayer.style.transform = this.backgroundFrontLayerXformStart;
        this.backgroundFrontLayer.style.opacity = 0;
        
        //Logo has to be scaled independently to prevent problems with translation
        this.logo.style.transform = this.logoXformStart;
        this.logo.style.zIndex = 10;
        this.logo.style.opacity = 0;
        this.logoSVG.style.transform = this.logoSVGXformStart;

        //Slide selected bar up
        this.pageHeader.style.transform = this.pageHeaderXformStart;
        
        //Slide unselected bars left
        this.unselectedBarArea.style.transform = this.unselectedBarAreaXformStart;

        //Slide contentPanel down
        this.contentPanel.style.transform = this.contentPanelXformStart;
    },
    fadeBackgroundsIn(stageCover) {
        //Remove our cover
        utils.removeEl(stageCover);

        const bgAnim = this.backgroundBackLayer.animate([
            {
                transform: this.backgroundBackLayerXformStart,
                opacity: 0.0,
            },
            {
                opacity: 0.1,
            },
            {
                transform: `translateX(0px) translateY(0px)`,
                opacity: 1,
            },
            
        ], {
            duration: 1000,
            easing: "linear",
        });

        const fgAnim = this.backgroundFrontLayer.animate([
            {
                transform: this.backgroundFrontLayerXformStart,
                opacity: 0.0,
            },
            {
                opacity: 0.1,
            },
            {
                transform: `translateX(0px) translateY(0px)`,
                opacity: 1,
            },
            
        ], {
            duration: 1000,
            easing: "linear",
        });

        //Clean up our transforms and kick off the next        
        bgAnim.addEventListener("finish", () => { 
            this.backgroundBackLayer.style.transform = null;
            this.backgroundBackLayer.style.opacity = 1;
        });
        
        fgAnim.addEventListener("finish", () => { 
            this.backgroundFrontLayer.style.transform = null;
            this.backgroundFrontLayer.style.opacity = 1;

            this.flyLogoIn();
        });
    },
    flyLogoIn() {
        const logoFinish = this.logoXformStart.replace(`rotate(1turn)`, `rotate(0turn)`)
        const logoAnim = this.logo.animate([
            {
                transform: this.logoXformStart,
                opacity: 0,
            },
            {
                transform: logoFinish,
                opacity: 1,
            },
            
        ], {
            duration: 500,
            easing: `ease-out`,
        });

        const logoSVG = this.logoSVG.animate([
            {
                transform: this.logoSVGXformStart,
            },
            {
                transform: `scale(1)`,
            },
            
        ], {
            duration: 500,
            easing: `ease-out`,
        });

        //Clean up our transforms and kick off the next        
        logoAnim.addEventListener("finish", () => { 
            this.logo.style.zIndex = 1;
            this.logo.style.opacity = 1;
        });
        
        logoSVG.addEventListener("finish", () => { 
            this.logoSVG.style.transform = null;

            //Move the rest in!
            this.strobeBackground(logoFinish);
        });        
    },
    strobeBackground(logoFinish) {
        const body = document.querySelector("BODY");
        const printLogoCover = body.querySelector("#printLogoCover");
        const bodyStrobeAnim = body.animate([
            {
                backgroundColor: "#FFFFFF"
            },
            {
                backgroundColor: "#000000"
            },
            {
                backgroundColor: "#FFFFFF"
            },
            {
                backgroundColor: "#000000"
            },
            {
                backgroundColor: "#FFFFFF"
            },
            {
                backgroundColor: "#333333"
            },
        ], {
            duration: 100,
            easing: "linear",
        });
        //Need to flash our cover too
        printLogoCover.animate([
            {
                backgroundColor: "#FFFFFF"
            },
            {
                backgroundColor: "#000000"
            },
            {
                backgroundColor: "#FFFFFF"
            },
            {
                backgroundColor: "#000000"
            },
            {
                backgroundColor: "#FFFFFF"
            },
            {
                backgroundColor: "#333333"
            },
        ], {
            duration: 100,
            easing: "linear",
        });
        bodyStrobeAnim.addEventListener("finish", () => {             
            //Move the rest in!
            this.parkLogo(logoFinish);
            this.slidePageHeadIn();
            this.slideUnSelectedBarsIn();
            this.slideContentPanelIn();
        });        
    },
    parkLogo(logoStart) {
        const logoAnim = this.logo.animate([
            {
                transform: logoStart,
            },
            {
                transform: `translateX(0px) translateY(0px)`,
            },
            
        ], {
            duration: 500,
            easing: `ease-in`,
        });

        this.animations += 1;
        //Clean up our transforms and kick off the next        
        logoAnim.addEventListener("finish", () => { 
            this.logo.style.transform = null;
            this.animations -= 1;
            this.finalize();
        });
    },
    slidePageHeadIn() {
        //Slide selected bar up
        const pageHeadAnim = this.pageHeader.animate([
            {
                transform: this.pageHeaderXformStart,
            },
            {
                transform: `translateX(0px) translateY(0px)`,
            },
            
        ], {
            duration: 500,
            easing: `ease-in`,
        });
        this.animations += 1;
        
        //Clean up our transforms and kick off the next        
        pageHeadAnim.addEventListener("finish", () => { 
            this.pageHeader.style.transform = null;
            this.animations -= 1;
            this.finalize();
        });
    },
    slideUnSelectedBarsIn() {
        const unSelBarsAnim = this.unselectedBarArea.animate([
            {
                transform: this.unselectedBarAreaXformStart,
            },
            {
                transform: `translateX(0px) translateY(0px)`,
            },
            
        ], {
            duration: 500,
            easing: `ease-in`,
        });
        this.animations += 1;
        
        //Clean up our transforms and kick off the next        
        unSelBarsAnim.addEventListener("finish", () => { 
            this.unselectedBarArea.style.transform = null;
            this.animations -= 1;
            this.finalize();
        });
    },
    slideContentPanelIn() {
        const contentPanelAnim = this.contentPanel.animate([
            {
                transform: this.contentPanelXformStart,
            },
            {
                transform: `translateX(0px) translateY(0px)`,
            },
            
        ], {
            duration: 500,
            easing: `ease-in`,
        });
        this.animations += 1;        

        //Clean up our transforms and kick off the next        
        contentPanelAnim.addEventListener("finish", () => { 
            this.contentPanel.style.transform = null;
            this.animations -= 1;
            this.finalize();
        });
    },
    finalize() {
        if(this.animations === 0) {
            this.mainContainer.dispatchEvent(this.finalizeBoot);
        }
    }
};