// Modules
import getMatchIndexes from "lib/reader/matches/find-indexes";
import wrapMatches from "lib/reader/matches/matches/wrap";

export default function(notes) {

    const currentCfi = new EPUBJS.EpubCFI(epub.getCurrentLocationCfi());
    let html = epub.renderer.doc.body.innerHTML;
    
    // Remove notes not in current chapter
    notes.filter(note => {
        return currentCfi.spinePos == (new EPUBJS.EpubCFI(note.cfi)).spinePos;
    })
    // Highlight notes currently viewable
    .forEach((note, i) => {
        const matches = getMatchIndexes(
            JSON.parse(note.note).highlighted, html
        );

        html = wrapMatches(matches, html, "note", i);
    });

    epub.renderer.doc.body.innerHTML = html;

}