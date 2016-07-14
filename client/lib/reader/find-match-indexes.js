// Build an array of start/end string indexes for each instance
// of needle in haystack
export default function(needle, haystack) {

    const pattern = new RegExp(needle, "gm");
    let indexes = [], match;

    while (match = pattern.exec(haystack)) {
        indexes.push([match.index, pattern.lastIndex]);
    }

    return indexes;

}