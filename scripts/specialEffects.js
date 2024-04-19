const specialEffects = {
    setHandles(handles) {
        const { innerWidth, innerHeight } = window;
        this.utils = utils;

        //just copy them into here
        for (let item in handles) {
            this[item] = handles[item];
        }
        this.logoSVG = this.logo.querySelector('img');
        this.isMobile = false;
        this.sparkDiv = null;
        this.sparkTimeout = null;

        const unselectedBarArea = this.unselectedBarArea.getBoundingClientRect();

        let pageHeaderStart = `translateY(-${this.pageHeader.offsetHeight * 1.5}px)`;
        let unselectedBarStart = `translateX(-${this.unselectedBarArea.offsetWidth * 1.5}px)`;
        let contentPanelStart = `translateY(${this.contentPanel.offsetHeight * 1.05}px)`;

        if (unselectedBarArea.y < 10) { //Likely mobile view so our transforms are a bit differnt
            this.isMobile = true;
            pageHeaderStart = `translateX(${this.pageHeader.offsetHeight * 10}px)`;
            unselectedBarStart = `translateY(-${this.unselectedBarArea.offsetHeight * 10}px)`;
            contentPanelStart = `translateY(${this.contentPanel.offsetWidth * 5}px)`;
        }

        //setup our intitial states
        this.backgroundBackLayerXformStart = `translateX(-${innerWidth + innerWidth / 3}px) translateY(0px)`;
        this.backgroundFrontLayerXformStart = `translateX(${innerWidth + innerWidth / 3}px) translateY(0px)`;
        this.logoXformStart = `translateX(${(innerWidth / 2) - (this.logo.offsetWidth / 2)}px) translateY(${(innerHeight / 2) - (this.logo.offsetHeight / 2)}px) rotate(1turn)`;
        this.logoSVGXformStart = 'scale(50)';
        this.pageHeaderXformStart = pageHeaderStart;
        this.unselectedBarAreaXformStart = unselectedBarStart;
        this.contentPanelXformStart = contentPanelStart;

        this.animations = 0;
        this.finalizeBoot = new CustomEvent(
            'finalizeBoot',
            {
                detail: {},
                bubbles: false,
                cancelable: true,
            }
        );
    },
    start() {
        //Stage it!
        this.stageAll();

        //Start it!
        this.fadeBackgroundsIn();
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
    fadeBackgroundsIn() {
        const bgAnim = this.backgroundBackLayer.animate([
            {
                transform: this.backgroundBackLayerXformStart,
                opacity: 0.0,
            },
            {
                transform: 'translateX(0px) translateY(0px)',
                opacity: 1,
            },

        ], {
            duration: 1000,
            easing: 'linear',
        });

        const fgAnim = this.backgroundFrontLayer.animate([
            {
                transform: this.backgroundFrontLayerXformStart,
                opacity: 0.0,
            },
            {
                transform: 'translateX(0px) translateY(0px)',
                opacity: 1,
            },

        ], {
            duration: 1000,
            easing: 'linear',
        });

        //Clean up our transforms and kick off the next        
        bgAnim.addEventListener('finish', () => {
            this.backgroundBackLayer.style.transform = '';
            this.backgroundBackLayer.style.opacity = 1;
        });

        fgAnim.addEventListener('finish', () => {
            this.backgroundFrontLayer.style.transform = '';
            this.backgroundFrontLayer.style.opacity = 1;

            this.flyLogoIn();
        });
    },
    flyLogoIn() {
        const logoFinish = this.logoXformStart.replace('rotate(1turn)', 'rotate(0turn)');
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
            duration: 750,
            easing: 'ease-out',
        });

        const logoSVG = this.logoSVG.animate([
            {
                transform: this.logoSVGXformStart,
            },
            {
                transform: 'scale(1)',
            },

        ], {
            duration: 750,
            easing: 'ease-out',
        });

        //Clean up our transforms and kick off the next        
        logoAnim.addEventListener('finish', () => {
            this.logo.style.zIndex = 1;
            this.logo.style.opacity = 1;
        });

        logoSVG.addEventListener('finish', () => {
            this.logoSVG.style.transform = '';

            //Move the rest in!
            this.strobeBackground(logoFinish);
        });
    },
    strobeBackground(logoFinish) {
        const body = document.querySelector('body');
        const printLogoCover = body.querySelector('#printLogoCover');
        const bodyStrobeAnim = body.animate([
            {
                backgroundColor: '#FFFFFF'
            },
            {
                backgroundColor: '#000000'
            },
            {
                backgroundColor: '#FFFFFF'
            },
            {
                backgroundColor: '#000000'
            },
            {
                backgroundColor: '#FFFFFF'
            },
            {
                backgroundColor: '#333333'
            },
        ], {
            duration: 75,
            easing: 'linear',
        });
        //Need to flash our cover too
        printLogoCover.animate([
            {
                backgroundColor: '#FFFFFF'
            },
            {
                backgroundColor: '#000000'
            },
            {
                backgroundColor: '#FFFFFF'
            },
            {
                backgroundColor: '#000000'
            },
            {
                backgroundColor: '#FFFFFF'
            },
            {
                backgroundColor: '#333333'
            },
        ], {
            duration: 75,
            easing: 'linear',
        });
        bodyStrobeAnim.addEventListener('finish', () => {
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
                transform: 'translateX(0px) translateY(0px)',
            },

        ], {
            duration: 500,
            easing: 'ease-in',
        });

        this.animations += 1;
        //Clean up our transforms and kick off the next        
        logoAnim.addEventListener('finish', () => {
            this.logo.style.transform = '';
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
                transform: 'translateX(0px) translateY(0px)',
            },

        ], {
            duration: 500,
            delay: 250,
            easing: 'ease-in',
        });
        this.animations += 1;

        //Clean up our transforms and kick off the next        
        pageHeadAnim.addEventListener('finish', () => {
            this.pageHeader.style.transform = '';
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
                transform: 'translateX(0px) translateY(0px)',
            },

        ], {
            duration: 500,
            easing: 'ease-in',
        });
        this.animations += 1;

        //Clean up our transforms and kick off the next        
        unSelBarsAnim.addEventListener('finish', () => {
            this.unselectedBarArea.style.transform = '';
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
                transform: 'translateX(0px) translateY(0px)',
            },

        ], {
            duration: 500,
            easing: 'ease-in',
        });
        this.animations += 1;

        //Clean up our transforms and kick off the next        
        contentPanelAnim.addEventListener('finish', () => {
            this.contentPanel.style.transform = '';
            this.animations -= 1;
            this.finalize();
        });
    },
    finalize() {
        if (this.animations === 0) {
            this.mainContainer.dispatchEvent(this.finalizeBoot);
        }
    },
    moveBackground(evt) {
        if (this.mainContainerInfo === undefined) { //Needed this since the boot sequence may or may not have run!
            this.mainContainer = document.querySelector('#mainContainer');
            this.mainContainerInfo = this.mainContainer.getBoundingClientRect();
        }

        const { clientX: x, clientY: y } = evt;
        const { height, width } = this.mainContainerInfo;
        const centerHeight = height / 2;
        const centerWidth = width / 2;

        const backLayer = document.querySelector('#backgroundBackLayer');
        const frontLayer = document.querySelector('#backgroundFrontLayer');

        const backMoveDampener = 50;
        const frontMoveDampener = 100;

        //shift our backgrounds depending on where our mouse is.
        backLayer.style.transform = `translate(${(centerWidth - x) / backMoveDampener}px, ${(centerHeight - y) / backMoveDampener}px)`;
        frontLayer.style.transform = `translate(${(centerWidth - x) / frontMoveDampener}px, ${(centerHeight - y) / frontMoveDampener}px)`;
    },
    createSpark() {
        const { innerWidth, innerHeight } = window;
        const distDivisor = 6;
        const sparkMaxDistanceX = innerWidth / distDivisor;
        const sparkMaxDistanceY = innerHeight / distDivisor;
        const numSparkPoints = this.utils.getRandomInt(3, 8, 0);
        const sparkPoints = [];
        const sparkZIndex = this.utils.getRandomInt(0, 3, 0);
        const sparkColors = ['#333333', '#00FFFF', '#FFFFFF'];

        let pointX, pointY = 0;
        for (let i = 0, j = numSparkPoints; i < j; i++) {

            if (i === 0) { //first point
                pointX = this.utils.getRandomInt(0, innerWidth, 0);
                pointY = this.utils.getRandomInt(0, innerHeight, 0);
                sparkPoints.push(`${pointX},${pointY}`);
            } else {
                pointX = this.utils.getRandomInt(pointX - sparkMaxDistanceX, pointX + sparkMaxDistanceX, 0);
                pointY = this.utils.getRandomInt(pointY - sparkMaxDistanceY, pointY + sparkMaxDistanceY, 0);
                sparkPoints.push(`${pointX},${pointY}`);
            }
        }

        //Can't use my createEl tools here since this is SVG, it also doesn't respond well to styles from stylesheets
        const elNs = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(elNs, 'svg');
        svg.setAttribute('height', `${innerHeight}`);
        svg.setAttribute('width', `${innerWidth}`);

        const sparkPath = document.createElementNS(elNs, 'path');
        sparkPath.classList.add('sparkPath');
        sparkPath.setAttribute('style', 'stroke:transparent;stroke-width:2;fill:none');
        sparkPath.setAttribute('d', `M ${sparkPoints.join(' ')}`);

        svg.appendChild(sparkPath);

        this.sparkDiv = this.utils.createEl('div', { class: 'sparkDiv', style: `z-index: ${sparkZIndex}`, 'aria-hidden': 'true' }, [svg], document.querySelector('body'));

        const sparkSteps = [];
        for (let i = 0, j = this.utils.getRandomInt(0, 15, 0); i < j; i++) {
            const color = (i == j - 1) ? 'transparent' : `${sparkColors[this.utils.getRandomInt(0, sparkColors.length - 1, 0)]}`;
            sparkSteps.push({
                stroke: color,
                strokeWidth: this.utils.getRandomInt(1, 3, 3)
            });
        }

        const sparkPathAnimate = sparkPath.animate(sparkSteps, {
            duration: 500,
            easing: 'linear',
        });

        sparkPathAnimate.addEventListener('finish', () => {
            if (this.sparkDiv !== null) {
                this.utils.removeEl(this.sparkDiv);
            }
            this.sparky();
        });
    },
    sparky() {
        if (this.utils === undefined) {
            this.utils = utils;
        }
        const minTime = 1000 * 10; //10sec 
        const maxTime = minTime * 9; //90 sec
        const timeOut = this.utils.getRandomInt(minTime, maxTime, 0);
        this.sparkTimeout = setTimeout(() => { this.createSpark(); }, timeOut);
    },
};