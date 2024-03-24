class Utils {
    constructor() {
        
    }
	
	linkAdjustor(linkLoc, startingDirectory, currentDirectory) {
		const fileName = linkLoc.substring(linkLoc.lastIndexOf("/"), linkLoc.length);				
		const linkLocParts = linkLoc.replace(fileName, "").split("/").filter(item => item === "..");
		const cdParts = currentDirectory.slice(0, -1).split("/");
		const chopFactor = cdParts.length - linkLocParts.length;
		const linkPath = cdParts.slice(0, 0 + (chopFactor)).join("/");
		
		return (`${startingDirectory}${linkPath}/${linkLoc.replaceAll("../", "")}`).replaceAll("//", "/");				
	}

	adjustLinks(pageContent, mainContainer, startingDirectory, currentDirectory) {
		const contentLinks = pageContent.querySelectorAll("A");
		const imgRegEx = new RegExp(/\.gif|\.jpg|\.png|\.svg/i);
				
		contentLinks.forEach((link, current) => {
			const { href } = link; //This returns some form of "Reconciled" location.. 
			const trueHref = link.getAttribute("href");
			
			if (/http:./i.test(trueHref) === false && imgRegEx.test(trueHref) === false) { //NOT Link to external
				
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


				const linkClickEvent = new CustomEvent(
					"showShot", 
					{
						detail: {
							pageURL: href,
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
	};

	adjustImages(pageContent, startingDirectory, currentDirectory) {
        const contentImages = pageContent.querySelectorAll("IMG");
        contentImages.forEach((img) => {
            const trueHref = img.getAttribute("src");
			const linkHref = this.linkAdjustor(trueHref, startingDirectory, currentDirectory);
			img.setAttribute("src", linkHref);
        });
	};

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
	};

	createEl(tag, attributes, children, parent, elementInstance) {

		let element = document.createElement(tag);

		attributes.forEach((item) => 
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
					var elEvents = attributes[i];
					if (!this.isArray(elEvents)) {
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
				element.setAttribute(i, attributes[i]);
			};
		});

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
	};


	appendEl(el, child) {
		el = this.get(el);

		if (!this.isArray(child)) {
			child = [child]
		}
		child.forEach((currChild) => {
			if (typeof currChild == "object") {
				el.appendChild(currChild);
			}
			else if (typeof currChild == "string" || typeof currChild == "number") {
				// element.appendChild(document.createTextNode(children));
				el.innerHTML += currChild;
			};
		});
	};

	removeEl (el) {
		el = this.get(el);

		if (!this.isArray(el)) {
			el = [el]
		}
		el.forEach((currEl) => {
			currEl.parentNode.removeChild(currEl);
		});
	};
}