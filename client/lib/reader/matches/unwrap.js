export default function(className) {

    const regex = new RegExp(
        `<span class="${className}" onclick=".+">`, 'm'
    );

    let element, parent;

    while (element = epub.renderer.doc.querySelector('.' + className)) {
        parent = element.parentElement;

        parent.innerHTML = parent.innerHTML.replace(regex, '').replace("</span>", '');
    }

}