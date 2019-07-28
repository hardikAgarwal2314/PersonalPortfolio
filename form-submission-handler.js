(function () {

    function validateHuman(honeypot) {
        if (honeypot) {  //if hidden form filled up
            console.log("Robot Detected!");
            return true;
        } else {
            console.log("Welcome Human!");
        }
    }

    // get all data in form and return object
    function getFormData(form) {
        let elements = form.elements;
        let honeypot;

        let fields = Object.keys(elements).filter(function (k) {
            if (elements[k].name === "honeypot") {
                honeypot = elements[k].value;
                return false;
            }
            return true;
        }).map(function (k) {
            if (elements[k].name !== undefined) {
                return elements[k].name;
                // special case for Edge's html collection
            } else if (elements[k].length > 0) {
                return elements[k].item(0).name;
            }
        }).filter(function (item, pos, self) {
            return self.indexOf(item) == pos && item;
        });

        let formData = {};
        fields.forEach(function (name) {
            let element = elements[name];

            // singular form elements just have one value
            formData[name] = element.value;

            // when our element has multiple items, get their values
            if (element.length) {
                let data = [];
                for (let i = 0; i < element.length; i++) {
                    let item = element.item(i);
                    if (item.checked || item.selected) {
                        data.push(item.value);
                    }
                }
                formData[name] = data.join(', ');
            }
        });

        // add form-specific values into the data
        formData.formDataNameOrder = JSON.stringify(fields);
        formData.formGoogleSheetName = form.dataset.sheet || "responses"; // default sheet name
        formData.formGoogleSend
            = form.dataset.email || ""; // no email by default

        console.log(formData);
        return {data: formData, honeypot};
    }

    function handleFormSubmit(event) {  // handles form submit without any jquery
        event.preventDefault();           // we are submitting via xhr below
        let form = event.target;
        let formData = getFormData(form);
        let data = formData.data;

        if (formData.honeypot) {
            return false;
        }

        disableAllButtons(form);
        let url = form.action;
        let xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function () {
            form.reset();
            tempAlert('Thanks for contacting !\n' +
                'I will get back to you soon!', 7000);
        };

        let encoded = Object.keys(data).map(function (k) {
            return encodeURIComponent(k) + "=" + encodeURIComponent(data[k]);
        }).join('&');
        xhr.send(encoded);
    }

    function loaded() {
        let forms = document.querySelectorAll("form.gform");
        for (let i = 0; i < forms.length; i++) {
            forms[i].addEventListener("submit", handleFormSubmit, false);
        }
    };

    function tempAlert(msg, duration) {
        var el = document.createElement("div");
        el.setAttribute("style", "background-color: #0404048f;\n" +
            "    position: absolute;\n" +
            "    height: 100px;\n" +
            "    width: 300px;\n" +
            "    left: 50%;\n" +
            "    color: white;\n" +
            "    margin-top: -100vh;\n" +
            "    padding: 0.5em;\n" +
            "    box-shadow: 0px 0px 30px -8px white;\n" +
            "    border: 1px solid white;\n" +
            "    transition: transform .2s;\n" +
            "    border-radius: 10px;");
        el.innerHTML = msg;
        document.body.appendChild(el);
        setTimeout(function(){
            el.parentNode.removeChild(el);
        },duration);
        console.log(el);
        document.body.appendChild(el);
    }

    document.addEventListener("DOMContentLoaded", loaded, false);

    function disableAllButtons(form) {
        let buttons = form.querySelectorAll("button");
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].disabled = true;
        }
    }
})();
