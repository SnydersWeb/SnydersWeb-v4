const contactForm = {
    contactFormValidator(evt) {
        const { name } = evt;
        const { email } = evt;
        const { message } = evt;
        const nameErr = name.parentNode.parentNode.querySelector('div.errMsg');
        const emailErr = email.parentNode.parentNode.querySelector('div.errMsg');
        const messageErr = message.parentNode.parentNode.querySelector('div.errMsg');
        const { value:nameVal } = name;
        const { value:emailVal } = email;
        const { value:messageVal } = message;
        let good = true;
        
        if (nameVal.length < 3) {
            name.classList.add('err');
            nameErr.innerText = 'Please enter your name.';
            good = false;
        } else {
            name.classList.remove('err');
            nameErr.innerText = '';
        }

        if (emailVal.length < 5 ) {
            email.classList.add('err');
            emailErr.innerText = 'Please enter your email address.';
            good = false;
        } else if (/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(emailVal) === false) {
            email.classList.add('err');
            emailErr.innerText = 'Please enter a valid email address.';
            good = false;
        } else {
            email.classList.remove('err');
            emailErr.innerText = '';
        }

        if (messageVal.length < 5) {
            message.classList.add('err');
            messageErr.innerText = 'Please enter a message';
            good = false;
        } else {
            message.classList.remove('err');
            messageErr.innerText = '';
        }

        let data = null;
        if(good === true) {
            data = new URLSearchParams();
            data.append('name', nameVal);
            data.append('email', emailVal);
            data.append('message', messageVal);
        }

        return data;
    },
    checkContactForm(evt) {
        const postData = this.contactFormValidator(evt);

        if (postData !== null) {
            this.submitContactForm(postData);
        }
    },
    async submitContactForm(postData) {
        let postURL = pageMaestro.linkAdjustor('parser.php');
        const { protocol } = window.location;
        //Local dev testing
        if (/file/.test(protocol)) {
            postURL = pageMaestro.linkAdjustor('dummyParser.html');
        }
        const rawResult = await pageFetcher.postData(postURL, postData) || '';
        const result = JSON.parse(rawResult.replaceAll("'", '"'));
        const resultDisplay = pageMaestro.contentPanel.querySelector('div.contactResult');
        const submitButton = pageMaestro.contentPanel.querySelector('INPUT[type="submit"]');

        resultDisplay.innerHTML = `${result.status}`
        resultDisplay.classList.remove('hide');

        if (Number(result.result) === 1) {
            submitButton.setAttribute('disabled', 'disabled');
        }
    },
};