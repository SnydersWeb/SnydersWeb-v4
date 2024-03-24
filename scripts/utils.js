class Utils {
    constructor() {
        
    }
	
	adjustLinks(pageContent, mainContainer, currentDirectory, startingDirectory) {
		const contentLinks = pageContent.querySelectorAll("A");
		const imgRegEx = new RegExp(/\.gif|\.jpg|\.png|\.svg/i);
		console.log(`SD: ${startingDirectory}`);
		console.log(`CD: ${currentDirectory}`);
				
		contentLinks.forEach((link) => {
			const { href } = link; //This returns some form of "Reconciled" location.. 
			const trueHref = link.getAttribute("href");
			if (/http:/i.test(href) === false && imgRegEx.test(href) === false) { //NOT Link to external
				const trueHrefParts = trueHref.split("/").filter(item => item === "..");
				const cdParts = currentDirectory.split("/");
				
				const linkPath = href.substring(href.lastIndexOf(startingDirectory) + startingDirectory.length, href.length); //.replace(startingDirectory, ""); // remove link path from it.
				console.log(`LinkPath:${linkPath}`);
				let path = '';

				const linkHref = `${startingDirectory}${linkPath}`;
				// const rawPath = href.replace(/\\/gi,"/").substring(0, href.replace(/\\/gi,"/").lastIndexOf("/"));
				console.log(`${link.innerText} href:${href}`);
				console.log(`${link.innerText} final:${linkHref}`);
				// const rawPathParts = rawPath.split('/');
				
				
				
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

	fixImages(pageContent) {
		const contentImages = pageContent.querySelectorAll("IMG");
		contentImages.forEach((img) => {
			const { src } = img;
			
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