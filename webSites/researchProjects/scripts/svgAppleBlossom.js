const svgAppleBlossom = {
    elNs: 'http://www.w3.org/2000/svg',
    timeoutValue: 0,
    svgCanvas: null,
    height: 400,
    width: 600,
    colors: {
        apple15: [
            '#000000',
            '#515c16',
            '#843d52',
            '#ea7d27',
            '#514888',
            '#e85def',
            '#f5b7c9',
            '#006752',
            '#00c82c',
            '#919191',
            '#c9d199',
            '#00a6f0',
            '#98dbc9',
            '#c8c1f7',
            '#ffffff'
        ],
        standard256: [
            '#800000',
            '#8B0000',
            '#A52A2A',
            '#B22222',
            '#DC143C',
            '#FF0000',
            '#FF6347',
            '#FF7F50',
            '#CD5C5C',
            '#F08080',
            '#E9967A',
            '#FA8072',
            '#FFA07A',
            '#FF4500',
            '#FF8C00',
            '#FFA500',
            '#FFD700',
            '#B8860B',
            '#DAA520',
            '#EEE8AA',
            '#BDB76B',
            '#F0E68C',
            '#808000',
            '#FFFF00',
            '#9ACD32',
            '#556B2F',
            '#6B8E23',
            '#7CFC00',
            '#7FFF00',
            '#ADFF2F',
            '#006400',
            '#008000',
            '#228B22',
            '#00FF00',
            '#32CD32',
            '#90EE90',
            '#98FB98',
            '#8FBC8F',
            '#00FA9A',
            '#00FF7F',
            '#2E8B57',
            '#66CDAA',
            '#3CB371',
            '#20B2AA',
            '#2F4F4F',
            '#008080',
            '#008B8B',
            '#00FFFF',
            '#00FFFF',
            '#E0FFFF',
            '#00CED1',
            '#40E0D0',
            '#48D1CC',
            '#AFEEEE',
            '#7FFFD4',
            '#B0E0E6',
            '#5F9EA0',
            '#4682B4',
            '#6495ED',
            '#00BFFF',
            '#1E90FF',
            '#ADD8E6',
            '#87CEEB',
            '#87CEFA',
            '#191970',
            '#000080',
            '#00008B',
            '#0000CD',
            '#0000FF',
            '#4169E1',
            '#8A2BE2',
            '#4B0082',
            '#483D8B',
            '#6A5ACD',
            '#7B68EE',
            '#9370DB',
            '#8B008B',
            '#9400D3',
            '#9932CC',
            '#BA55D3',
            '#800080',
            '#D8BFD8',
            '#DDA0DD',
            '#EE82EE',
            '#FF00FF',
            '#DA70D6',
            '#C71585',
            '#DB7093',
            '#FF1493',
            '#FF69B4',
            '#FFB6C1',
            '#FFC0CB',
            '#FAEBD7',
            '#F5F5DC',
            '#FFE4C4',
            '#FFEBCD',
            '#F5DEB3',
            '#FFF8DC',
            '#FFFACD',
            '#FAFAD2',
            '#FFFFE0',
            '#8B4513',
            '#A0522D',
            '#D2691E',
            '#CD853F',
            '#F4A460',
            '#DEB887',
            '#D2B48C',
            '#BC8F8F',
            '#FFE4B5',
            '#FFDEAD',
            '#FFDAB9',
            '#FFE4E1',
            '#FFF0F5',
            '#FAF0E6',
            '#FDF5E6',
            '#FFEFD5',
            '#FFF5EE',
            '#F5FFFA',
            '#708090',
            '#778899',
            '#B0C4DE',
            '#E6E6FA',
            '#FFFAF0',
            '#F0F8FF',
            '#F8F8FF',
            '#F0FFF0',
            '#FFFFF0',
            '#F0FFFF',
            '#FFFAFA',
            '#000000',
            '#696969',
            '#808080',
            '#A9A9A9',
            '#C0C0C0',
            '#D3D3D3',
            '#DCDCDC',
            '#F5F5F5',
            '#FFFFFF',
        ],
    },
    colorScheme: 'apple15',
    colorSequence: 'random',
    colorIdx: 0,
    rows: 40,
    cols: 40,
    lineCount: 1,
    stepping: 1,
    refresh: 100,
    rowHeight: 0,
    colWidth: 0,
    lines: { //Lines is our registry so we can clean up elements as we draw them.
        top: [],
        right: [],
        bottom: [],
        left: [],
    },
    lineIdx: { //This will store indices of each line
        top: [],
        right: [],
        bottom: [],
        left: [],
    },
    heightWidthRatio: .75,
    widthHeightRatio: 1.33,    
    async awaitElement(selector) {
        while ( document.querySelector(selector) === null) {
            await new Promise( resolve =>  requestAnimationFrame(resolve) )
        }

        return document.querySelector(selector);
    },
    async setCanvasSize() {
        const contentArea = await this.awaitElement('#content');
        this.svgCanvas = await this.awaitElement('#blossom');

        const { offsetHeight: contentHeight, offsetWidth: contentWidth } = contentArea;
        const { innerHeight, innerWidth } = window;
        const aspectRatio = (innerHeight / innerWidth);
        
        let canvasHeight;
        let canvasWidth;
        
        if (aspectRatio > 1.4) { //Screen is way taller than it is wide, likely mobile
            //Let's make height the bounder then
            canvasWidth = Math.round(contentWidth * .75);
            canvasHeight = Math.round(contentWidth * this.heightWidthRatio);
        } else { //Normal screen (I hope)
            canvasWidth = Math.round(contentWidth * .9);
            canvasHeight = Math.round(contentWidth * this.heightWidthRatio);

            if (canvasHeight > contentHeight) {
                canvasHeight = Math.round(contentHeight * .9);
                canvasWidth = Math.round(canvasHeight * this.widthHeightRatio);
            }
        }

        this.height = canvasHeight;
        this.width = canvasWidth;

        this.svgCanvas.setAttribute('height', canvasHeight);
        this.svgCanvas.setAttribute('width', canvasWidth);

        this.runBlossom();
    },
    clearAll() {
        window.clearTimeout(this.timeoutValue);
        const lines = this.svgCanvas.querySelectorAll('rect');
        if (lines.length > 0) {
            for (let item in this.lines) {
                this.lines[item].forEach(line => {
                    this.svgCanvas.removeChild(line);
                });
            };
        } 
        for (let item in this.lineIdx) {
            this.lines[item] = [];
            this.lineIdx[item] = [];
        };
        this.colorIdx = 0;
    },
    setParams(form) {
        //Collect our submitted values
        const { colorScheme, colorSequence, rows, cols, lines, stepping, refresh } = form;
        const { value: colorSchemeVal } = colorScheme;
        const { value: colorSequenceVal } = colorSequence;
        const { value: rowsVal } = rows;
        const { value: colsVal } = cols;
        const { value: linesVal } = lines;
        const { value: steppingVal } = stepping;
        const { value: refreshVal } = refresh;

        //Update our object here
        this.colorScheme = colorSchemeVal;
        this.colorSequence = colorSequenceVal;
        this.rows = /max/.test(rowsVal) ? this.height : Number(rowsVal);
        this.cols = /max/.test(colsVal) ? this.width : Number(colsVal);
        this.lineCount = Number(linesVal);
        this.stepping = Number(steppingVal);
        this.refresh = Number(refreshVal);

        this.setCanvasSize();
    },
    runBlossom() {
        
        this.rowHeight = Math.round(this.height / this.rows);
        this.colWidth = Math.round(this.width / this.cols);

        //clean and clear all
        this.clearAll();

        //Map didn't work on arrays with arrays of empty arrays
        for (let i = 0, j = this.lineCount; i < j; i += 1) {
            for (let item in this.lineIdx) {
                let initPos;
                let initDir;
                const initStep = this.stepping;

                if (/top/.test(item)) {
                    initPos = Math.round(0 - (i * (this.height / this.lineCount)));
                    initDir = 'inc';
                } else if (/right/.test(item)) {
                    initPos = Math.round(this.width + (i * (this.width / this.lineCount)) - (this.colWidth));
                    initDir = 'dec';
                } else if (/bottom/.test(item)) {
                    initPos = Math.round(this.height + (i * (this.height / this.lineCount)) - (this.rowHeight));
                    initDir = 'dec';
                } else if (/left/.test(item)) {
                    initPos = Math.round(0 - (i * (this.width / this.lineCount)));
                    initDir = 'inc';
                }
                this.lineIdx[item].push({
                    pos: initPos,
                    step: initStep,
                    dir: initDir
                });
            };
        }

        //Our setup is now done
        this.timeoutValue = setInterval(() => { this.moveLines(); }, this.refresh);
    },
    moveLines() {
        //Pick color
        let color;
        if (/fullRGB/.test(this.colorScheme)) {
            let rColor, gColor, bColor;
            
            try {
                rColor = utils.getRandomInt(0, 255, 0);
                gColor = utils.getRandomInt(0, 255, 0);
                bColor = utils.getRandomInt(0, 255, 0);
            } catch (err) {
                rColor = 255;
                gColor = 255;
                bColor = 255;
            }
            color = `#${rColor.toString(16)}${gColor.toString(16)}${bColor.toString(16)}`;
        } else {
            const colorScheme = this.colors[this.colorScheme];
            if (/sequential/.test(this.colorSequence)) {
                color = colorScheme[this.colorIdx];
                if (this.colorIdx >= colorScheme.length) {
                    this.colorIdx = 1;
                } else {
                    this.colorIdx += 1;
                }
            } else {
                let colorIdx;
                try {
                    colorIdx = utils.getRandomInt(0, colorScheme.length, 0);
                } catch (err) {
                    colorIdx = 0;
                }
                color = colorScheme[colorIdx];
            }
        }

        for (let i = 0, j = this.lineCount; i < j; i += 1) {
            for (let item in this.lineIdx) {
                let currLine = this.lineIdx[item][i];
                let newLineInfo = { ...currLine };
                let height, width, xPos, yPos;
                let nextStepDist = 0;

                if (/top|bottom/.test(item)) {
                    height = this.rowHeight;
                    width = this.width;
                    xPos = 0;
                    yPos = currLine.pos;
                    nextStepDist = (currLine.step * this.rowHeight);

                    if (/inc/.test(currLine.dir)) {
                        newLineInfo.pos += nextStepDist;
                        if (newLineInfo.pos >= (this.height - this.rowHeight)) {
                            newLineInfo.pos = this.height - this.rowHeight;
                            newLineInfo.dir = 'dec';
                        }
                    } else {
                        newLineInfo.pos -= nextStepDist;
                        if (newLineInfo.pos <= 0) {
                            newLineInfo.pos = 0;
                            newLineInfo.dir = 'inc';
                        }
                    }
                } else if (/right|left/.test(item)) {
                    height = this.height;
                    width = this.colWidth;
                    xPos = currLine.pos;
                    yPos = 0;
                    nextStepDist = (currLine.step * this.colWidth);

                    if (/inc/.test(currLine.dir)) {
                        newLineInfo.pos += nextStepDist;
                        if (newLineInfo.pos >= (this.width - this.colWidth)) {
                            newLineInfo.pos = this.width - this.colWidth;
                            newLineInfo.dir = 'dec';
                        }
                    } else {
                        newLineInfo.pos -= nextStepDist;
                        if (newLineInfo.pos <= 0) {
                            newLineInfo.pos = 0;
                            newLineInfo.dir = 'inc';
                        }
                    }
                }

                //Next draw our line
                const rect = document.createElementNS(this.elNs, 'rect');
                rect.setAttribute('style', `stroke:transparent;fill:${color}`);
                rect.setAttribute('width', width);
                rect.setAttribute('height', height);
                rect.setAttribute('x', xPos);
                rect.setAttribute('y', yPos);

                //Append it to the canvas
                this.svgCanvas.appendChild(rect);

                //Update our information about where the line is.
                this.lineIdx[item][i] = newLineInfo;

                //Get our boundary on how many lines can be on screen
                const lineLimit = (/top|bottom/.test(item) ? this.rows : this.cols);

                //Add it to our registry
                this.lines[item].push(rect);

                //Clean/Remove buried lines
                if (this.lines[item].length > lineLimit) {
                    this.svgCanvas.removeChild(this.lines[item][0]);
                    this.lines[item] = this.lines[item].slice(1); //Remove it from the array.
                }
            };
        }
    },
};

