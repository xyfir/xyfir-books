export default function() {

    let options = {
        url: "", fn: () => {}, method: "GET", dataType: "json",
        form: {}, query: {}
    };

    // request("url", (res) => {})
    if (typeof arguments[0] == "string") {
        options.url = arguments[0];
        options.fn = arguments[1];
    }
    // request({ url, success|fn, ?method, ?data, ?dataType })
    else if (arguments.length == 1) {
        Object.assign(options, arguments[0]);

        // Old version used success() for callback
        if (options.success) options.fn = options.success;
    }
    // request({ url, ?method, ?form, ?dataType }, (res) => {})
    else {
        Object.assign(options, arguments[0]);
        options.fn = arguments[1];
    }

    // Old version used data{} for form data
    if (options.data) options.form = options.data;

    // Build query string from object and append to url
    if (Object.keys(options.query).length) {
        options.url += "?" + Object.keys(options.query).map(q => {
            return q + "=" + encodeURIComponent(options.query[q]);
        }).join("&");
    }

    let request = new XMLHttpRequest();
    
    // Set method and URL
    request.open(options.method, options.url, true);
    
    // Handle response
    request.onload = function() {
        if (this.status >= 200 && this.status < 400) {
            switch (options.dataType) {
                case "text":
                    options.fn(this.responseText, this.status); break;
                default:
                    options.fn(JSON.parse(this.responseText), this.status);
            }
        }
    };
    
    // Send request + form
    if (options.method == "GET") {
        request.send();
    }
    else {
        request.setRequestHeader(
            "Content-Type", "application/x-www-form-urlencoded"
        );
        request.send(Object.keys(options.form).map(key => 
            key + "=" + encodeURIComponent(options.form[key])
        ).join("&"));
    }
    
};