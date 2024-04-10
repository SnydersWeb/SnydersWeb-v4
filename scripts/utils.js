const utils = {
    linkAdjustor(linkLoc, startingDirectory = pageMaestro.getStartingDir(), currentDirectory = pageMaestro.getCurrentDir()) {
		const fileName = linkLoc.substring(linkLoc.lastIndexOf("/"), linkLoc.length);				
		const linkLocParts = linkLoc.replace(fileName, "").split("/").filter(item => item === "..");
		const cdParts = currentDirectory.slice(0, -1).split("/");
		const chopFactor = cdParts.length - linkLocParts.length;
		const linkPath = cdParts
							.slice(0, 0 + (chopFactor))
							.filter((item, index) => cdParts.indexOf(item) === index) //Quick check to ensure we don't have dups
							.join("/");
		
		return (`${startingDirectory}${linkPath}/${linkLoc.replaceAll("../", "")}`).replaceAll("//", "/");				
	},

	adjustLinks(pageContent, mainContainer, startingDirectory, currentDirectory) {
		const contentLinks = pageContent.querySelectorAll("A");
		const imgRegEx = new RegExp(/\.gif|\.jpg|\.png|\.svg/i);
				
		contentLinks.forEach((link, current) => {
			const { href } = link; //This returns some form of "Reconciled" location.. 
			const trueHref = link.getAttribute("href");
			const { nofetch:rawNoFetch } = link.dataset;
			const noFetch = /true/i.test(rawNoFetch); //Some links we do NOT want going through the fetch system!
			
			if (/http/i.test(trueHref) === false && /mailto/i.test(trueHref) === false && imgRegEx.test(trueHref) === false && noFetch === false) { //NOT Link to external
				
				const linkHref = this.linkAdjustor(trueHref, startingDirectory, currentDirectory);
				
				const linkClickEvent = new CustomEvent(
					"fetchPage", 
					{
						detail: {
							pageURL: linkHref
						}, 
						bubbles: false,
						cancelable: true,
					}
				);

				link.setAttribute('href', "JavaScript:void(0);");
				link.dataset.link = linkHref;
				link.addEventListener('click', () => { mainContainer.dispatchEvent(linkClickEvent); });
			} else if (imgRegEx.test(href)) { //special image link

				const linkHref = this.linkAdjustor(trueHref, startingDirectory, currentDirectory);
				
				const linkClickEvent = new CustomEvent(
					"showShot", 
					{
						detail: {
							pageURL: linkHref,
							name: 'screen_shot',
							resize: true,
							width: 'auto',
							height: 'auto',
						}, 
						bubbles: false,
						cancelable: true,
					}
				);

				link.setAttribute('href', "JavaScript:void(0);");
				link.addEventListener('click', () => { mainContainer.dispatchEvent(linkClickEvent); });
			} 
		});
	},

	adjustImages(pageContent, startingDirectory, currentDirectory) {
        const contentImages = pageContent.querySelectorAll("IMG");
        contentImages.forEach((img) => {
            const trueHref = img.getAttribute("src");
			const linkHref = this.linkAdjustor(trueHref, startingDirectory, currentDirectory);
			img.setAttribute("src", linkHref);
        });
	},

	showShot(fetchInfo) {
		const { detail } = fetchInfo;
		let { resize } = detail;
		let { width } = detail;
		let { height } = detail;
		
		if (/true/i.test(resize)) {
			resize = "resizable,";
		} else {
			resize = "";
		}
		if (width === "auto") {
			width = window.innerWidth/2;
		}
		if (height === "auto") {
			height = window.innerHeight/2;
		}
		window.open(detail.pageURL, detail.name, "scrollbars=yes,menubar=no," + resize + "width=" + width + ",height=" + height);
	},
	
	getRandomInt(min, max, dec) {
		return Number((Math.random() * (max - min) + min).toFixed(dec));
	},

	getIsMobile() {
		return (('ontouchstart' in window) ||
		 (navigator.maxTouchPoints > 0) ||
		 (navigator.msMaxTouchPoints > 0));
	},

	get(el) {
		if (typeof el == "string" || typeof el == "number") {
			el = document.querySelector(el);
		}
		return el;
	},

	createEl(tag, attributes, children, parent, elementInstance) {

		let element = document.createElement(tag);

		for (let item in attributes)
		{
			if (/className|class/i.test(item))
			{
				element.className = attributes[item];
			}
			else if (/style/i.test(item))
			{
				this.setStyle(element,attributes[i]);
			}
			else if (/Events/i.test(item))
			{
				if (typeof Events != "undefined") {
					const elEvents = attributes[i];
					if (!Array.isArray(elEvents)) {
						elEvents = [elEvents]
					}

					elEvents.forEach((elEvent) => {
						elEvent.element = element;
						Events.add(elEvent);
					});
				}
			}
			else
			{
				element.setAttribute(item, attributes[item]);
			};
		};

		// <map> also needs an ID to work correctly
		if (tag.match(/^map$/i) && attributes && attributes.name && !attributes.id) {
			element.setAttribute("id", attributes.name);
		}

		if (arguments.length > 2 && children != undefined && children !== "") {
			this.appendEl(element, children);
		};

		if (parent) {
			this.appendEl(parent, element);
		}

		return (elementInstance) ? new ElementObject(element) : element;
	},

	appendEl(el, child) {
		el = this.get(el);

		if (!Array.isArray(child)) {
			child = [child]
		}
		child.forEach((currChild) => {
			if (typeof currChild == "object") {
				el.appendChild(currChild);
			}
			else if (typeof currChild == "string" || typeof currChild == "number") {
				el.innerHTML += currChild;
			};
		});
	},

	removeEl(el) {
		let elItem = this.get(el);
		let retVal = elItem;
		if (!Array.isArray(elItem)) {
			elItem = [elItem]
		}
		elItem.forEach((currEl) => {
			if (currEl !== undefined && currEl.parentNode !== undefined) {
				retVal = currEl.parentNode.removeChild(currEl);
			}
		});
		return retVal;
	},

	checkContactForm(evt) {
        const { name } = evt;
        const { email } = evt;
        const { message } = evt;
        const nameErr = name.parentNode.parentNode.querySelector("DIV.errMsg");
        const emailErr = email.parentNode.parentNode.querySelector("DIV.errMsg");
        const messageErr = message.parentNode.parentNode.querySelector("DIV.errMsg");
        const { value:nameVal } = name;
        const { value:emailVal } = email;
        const { value:messageVal } = message;
        let good = true;
        
        if (nameVal.length < 3) {
            name.classList.add("err");
            nameErr.innerText = "Please enter your name.";
            good = false;
        } else {
            name.classList.remove("err");
            nameErr.innerText = "";
        }

        if (emailVal.length < 5 ) {
            email.classList.add("err");
            emailErr.innerText = "Please enter your email address.";
            good = false;
        } else if (/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(emailVal) === false) {
            email.classList.add("err");
            emailErr.innerText = "Please enter a valid email address.";
            good = false;
        } else {
            email.classList.remove("err");
            emailErr.innerText = "";
        }

        if (messageVal.length < 5) {
            message.classList.add("err");
            messageErr.innerText = "Please enter a message";
            good = false;
        } else {
            message.classList.remove("err");
            messageErr.innerText = "";
        }

		let data = null;
        if(good === true) {
            data = new URLSearchParams();
            data.append("name", nameVal);
            data.append("email", emailVal);
            data.append("message", messageVal);
        }

		return data;

    },
}