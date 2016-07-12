export default function(matches, html, className, key) {

    // Offset required since we're manipulating the HTML and therefore
    // changing the length / indexes
    let offset = 0;
    
    matches.forEach(index => {
        const start = index[0] + offset;
        const end = index[1] + offset;

        html = html.substring(0, start)
            + `<span class="${className}" key="${key}">`
                + html.substring(start, end)
            + "</span>"
            + html.substring(end);

        offset += (29 + className.length + key.length);
    });

    return html;

}