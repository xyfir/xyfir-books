export default function (url, method, fieldName, files, fn) {
    
    let fd = new FormData();
    
    files.forEach(f => {
        formData.append(fieldName, f);
    });

    let xhr = new XMLHttpRequest();

    xhr.open(method, url, true);
    
    request.onload = () => fn(JSON.parse(this.responseText));

    xhr.send(formData);
    
};