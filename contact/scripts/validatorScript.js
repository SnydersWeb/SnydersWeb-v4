const contactForm = {
    contactFormValidator(formEl) {
        const { name, email, message, website } = formEl;
        const nameErr = name.parentNode.parentNode.querySelector('div.errMsg');
        const emailErr = email.parentNode.parentNode.querySelector('div.errMsg');
        const messageErr = message.parentNode.parentNode.querySelector('div.errMsg');
        
        const nameVal = name.value.trim();
        const emailVal = email.value.trim();
        const messageVal = message.value.trim();
        const websiteVal = website ? website.value.trim() : '';
        let good = true;

        if (nameVal.length < 3) {
            name.classList.add('err');
            nameErr.innerText = 'Please enter your name.';
            good = false;
        } else {
            name.classList.remove('err');
            nameErr.innerText = '';
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (emailVal.length < 5) {
            email.classList.add('err');
            emailErr.innerText = 'Please enter your email address.';
            good = false;
        } else if (!emailRegex.test(emailVal)) {
            email.classList.add('err');
            emailErr.innerText = 'Please enter a valid email address.';
            good = false;
        } else {
            email.classList.remove('err');
            emailErr.innerText = '';
        }

        if (messageVal.length < 5) {
            message.classList.add('err');
            messageErr.innerText = 'Please enter a message.';
            good = false;
        } else {
            message.classList.remove('err');
            messageErr.innerText = '';
        }

        let data = null;
        if (good) {
            data = new URLSearchParams();
            data.append('name', nameVal);
            data.append('email', emailVal);
            data.append('message', messageVal);
            data.append('website', websiteVal); // Passed to trigger honeypot detection in PHP
        }

        return data;
    },

    checkContactForm(formEl) {
        const postData = this.contactFormValidator(formEl);

        if (postData !== null) {
            this.submitContactForm(postData);
        }
    },

    async submitContactForm(postData) {
        let postURL = pageMaestro.linkAdjustor('parser.php');
        const { protocol } = window.location;

        // Local dev testing
        if (/file/.test(protocol)) {
            postURL = pageMaestro.linkAdjustor('dummyParser.html');
        }

        try {
            const rawResult = await pageFetcher.postData(postURL, postData) || '{}';
            // Parses valid JSON directly, fallback handles legacy single quotes if testing old backend
            const cleanResult = typeof rawResult === 'string' ? rawResult.replaceAll("'", '"') : JSON.stringify(rawResult);
            const result = JSON.parse(cleanResult);

            const resultDisplay = pageMaestro.contentPanel.querySelector('div.contactResult');
            const submitButton = pageMaestro.contentPanel.querySelector('INPUT[type="submit"]');

            resultDisplay.textContent = result.status || 'Submission completed.';
            resultDisplay.classList.remove('hide');

            if (Number(result.result) === 1) {
                submitButton.setAttribute('disabled', 'disabled');
            }
        } catch (err) {
            const resultDisplay = pageMaestro.contentPanel.querySelector('div.contactResult');
            resultDisplay.textContent = 'An error occurred while submitting the form. Please try again later.';
            resultDisplay.classList.remove('hide');
        }
    }
};