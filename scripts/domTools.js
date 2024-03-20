
export const createEl = (tag, attributes, children, parent, elementInstance) => {

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


export const appendEl = (el, child) => {
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

export const removeEl = (el) => {
	el = this.get(el);

	if (!this.isArray(el)) {
		el = [el]
	}
    el.forEach((currEl) => {
        currEl.parentNode.removeChild(currEl);
    });
};
