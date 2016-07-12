// Modules
import getMatchIndexes from "lib/reader/find-match-indexes";
import wrapMatches from "lib/reader/wrap-matches";

export default function(notes) {

    const currentCfi = new EPUBJS.EpubCFI(epub.getCurrentLocationCfi());
    let html = epub.renderer.doc.body.innerHTML;
    
    // Remove notes not in current chapter
    notes.filter(note => {
        return currentCfi.spinePos == (new EPUBJS.EpubCFI(note.cfi)).spinePos;
    })
    // Highlight notes currently viewable
    .forEach(note => {
        const matches = getMatchIndexes(
            JSON.parse(note.note).highlighted, html
        );

        html = wrapMatches(matches, html, "note", note.cfi);
    });

    epub.renderer.doc.body.innerHTML = html;

}