export default function (url, fn, toArrayBuffer = false) {
    
    let xhr = new XMLHttpRequest;
    
    // Receive file blob from server
    xhr.onload = () => {
        if (toArrayBuffer) {
            let fr = new FileReader;
            fr.onload = () => fn(fr.result);
            fr.readAsArrayBuffer(xhr.response);
        }
        else {
            fn(xhr.response);
        }
    };

    xhr.responseType = "blob";
    xhr.open("GET", url);
    xhr.send();
    
}