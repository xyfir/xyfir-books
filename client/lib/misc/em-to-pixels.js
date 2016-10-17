/* Convert 1em to pixels */
export default function (selector) {

    let parent = document.querySelector(selector || "body");

    let div = document.createElement("div");
    div.style.width = "1000em";
    
    parent.appendChild(div);
    
    const pixels = div.offsetWidth / 1000;
    parent.removeChild(div);
    
    return pixels;

}