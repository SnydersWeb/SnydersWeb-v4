const utils = {
	
	showShot(fetchInfo) {
		const { detail } = fetchInfo;
		let { resize } = detail;
		let { width } = detail;
		let { height } = detail;

		if (/true/i.test(resize)) {
			resize = 'resizable,';
		} else {
			resize = '';
		}
		if (width === 'auto') {
			width = window.innerWidth / 2;
		}
		if (height === 'auto') {
			height = window.innerHeight / 2;
		}
		window.open(detail.pageURL, detail.name, `scrollbars=yes,menubar=no,${resize}width=${width},height=${height}`);
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
		if (typeof el == 'string' || typeof el == 'number') {
			el = document.querySelector(el);
		}
		return el;
	},

	setStyle(el, styles) {

		el = this.get(el);
		if (!el) {
			return;
		}

		const pairs = [];
		styles = styles.split(';');

		styles.forEach(style => {
			const nv = style.replace(':', '{:}').split('{:}');

			if (nv.length > 1) {
				nv[0] = nv[0].replace(/\-(.)/g, function () {
					return arguments[1].toUpperCase();
				}).replace(/\s/g, '');

				pairs.push({ n: nv[0], v: nv[1].replace(/^\s*|\s*$/g, '') });
			}
		});

		if (!Array.isArray(el)) {
			el = [el]
		}

		var attributeMap = {
			'float': ['cssFloat', 'styleFloat']
		}

		el.forEach(item => {
			pairs.forEach(pair => {
				if (attributeMap[pair.n] !== undefined) {
					attributeMap[pair.n].forEach(att => {
						pairs.push({ n: att, v: pair.v });
					});
				}
				item.style[pair.n] = pair.v;
			});
		});

	},

	createEl(tag, attributes, children, parent, elementInstance) {

		let element = document.createElement(tag);

		for (let item in attributes) {
			if (/className|class/i.test(item)) {
				element.classList.add(attributes[item]);
			}
			else if (/style/i.test(item)) {
				this.setStyle(element, attributes[item]);
			}
			else if (/Events/i.test(item)) {
				if (typeof Events !== 'undefined') {
					const elEvents = attributes[item];
					if (!Array.isArray(elEvents)) {
						elEvents = [elEvents]
					}

					elEvents.forEach((elEvent) => {
						elEvent.element = element;
						Events.add(elEvent);
					});
				}
			}
			else {
				element.setAttribute(item, attributes[item]);
			};
		};

		// <map> also needs an ID to work correctly
		if (tag.match(/^map$/i) && attributes && attributes.name && !attributes.id) {
			element.setAttribute('id', attributes.name);
		}

		if (arguments.length > 2 && children != undefined && children !== '') {
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
			if (typeof currChild == 'object') {
				el.appendChild(currChild);
			}
			else if (typeof currChild == 'string' || typeof currChild == 'number') {
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
};

export default { utils };