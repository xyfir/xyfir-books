export default function(matches, html, type, key) {

    // Offset required since we're manipulating the HTML and therefore
    // changing the length / indexes
    let offset = 0;
    
    matches.forEach(index => {
        const start = index[0] + offset;
        const end = index[1] + offset;

        html = html.substring(0, start)
            + `<span class="${type}" onclick="parent.epub.onClick('${type}','${key}')">`
                + html.substring(start, end)
            + "</span>"
            + html.substring(end);

        offset += (59 + (type.length * 2) + key.length);
    });

    return html;

}