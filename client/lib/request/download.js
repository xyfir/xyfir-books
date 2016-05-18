export default function (url, fn) {
    
    let xhr = new XMLHttpRequest();
    
    // Receive file blob from server
    xhr.onload = () => fn(xhr.response);

    xhr.responseType = "blob";
    xhr.open("GET", url);
    xhr.send();
    
}