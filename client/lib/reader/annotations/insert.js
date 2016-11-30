import escapeRegex from "escape-string-regexp";

// Modules
import getMatchIndexes from "lib/reader/matches/find-indexes";
import wrapMatches from "lib/reader/matches/wrap";

export default function (set, markers) {

    let html = epub.renderer.doc.body.innerHTML;

    // Loop through all items in set
    set.items.forEach(item => {
        // Loop through all search queries in item
        item.searches.forEach((search, searchIndex) => {
            // Get start/end string indexes for each match
            let matches = getMatchIndexes(
                search.regex ? search.text : escapeRegex(search.text),
                html
            );

            if (!search.range.global) {
                // Get current chapter index to compare with chapter in markers
                let chapter = 0;
                Object.keys(epub.zip.zip.files).forEach((file, i) => {
                    if (file == epub.currentChapter.href) chapter = i;
                });

                // Filter out invalid matches based on range.before|after
                matches = matches.filter(match => {
                    // Get before/after marker objects
                    // Each object contains chapter index and string index
                    // of where marker occured in book
                    const before = markers[
                        `${set.id}-${item.id}-${searchIndex}-1`
                    ];
                    const after  = markers[
                        `${set.id}-${item.id}-${searchIndex}-2`
                    ];

                    if (search.range.before) {
                        // Marker could not be found
                        if (before === undefined)
                            return false;
                        // User has passed chapter where marker occurs
                        else if (before.chapter < chapter)
                            return false;
                        // User has passed index within chapter where marker occurs
                        else if (before.chapter == chapter && before.index < match[0])
                            return false;
                    }

                    if (search.range.after) {
                        if (after === undefined)
                            return false;
                        // User has yet to reach chapter where marker occurs
                        else if (after.chapter > chapter)
                            return false;
                        // User has yet to reach index in chapter where marker occurs
                        else if (after.chapter == chapter && after.index > match[0])
                            return false;
                    }

                    return true;
                });
            }

            html = wrapMatches(
                matches, html, "annotation", set.id + "-" + item.id
            );
        });
    });

    epub.renderer.doc.body.innerHTML = html;

}