/* Convert 1em to pixels */
export default function (selector) {

    let div = document.createElement("div");
    div.style.width = "1000em";
    
    document.querySelector(selector || "body").appendChild(div);
    
    const pixels = div.offsetWidth / 1000;
    parentElement.removeChild(div);
    
    return pixels;

}