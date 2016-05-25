export default function (url, method, fieldName, files, fn) {
    
    let fd = new FormData();
    
    files.forEach(f => {
        fd.append(fieldName, f);
    });

    let xhr = new XMLHttpRequest();

    xhr.open(method, url, true);
    xhr.onload = () => fn(JSON.parse(xhr.responseText));
    xhr.send(fd);
    
};