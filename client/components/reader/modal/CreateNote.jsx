import React from "react";

// Modules
import request from "lib/request/index";

// Constants
import { URL } from "constants/config";

export default class CreateNote extends React.Component {

    constructor(props) {
        super(props);
        
        if (!navigator.onLine) {
            this.props.onClose();
            swal(
                "Error", "This feature requires internet access", "error"
            );
        }
        else if (!!epub.renderer.selectedRange) {
            if (epub.renderer.selectedRange.toString().length < 10) {
                this.props.onClose();
                swal(
                    "Error",
                    "Selected text must be at least 10 characters long",
                    "error"
                );
            }
        }
        else {
            this.props.onClose();
            swal(
                "Error",
                "You must highlight text first to create a note.",
                "error"
            );
        }
        
        this.onCreateNote = this.onCreateNote.bind(this);
    }
    
    onCreateNote() {
        const data = {
            cfi: (new EPUBJS.EpubCFI()).generateCfiFromRangeAnchor(
                epub.renderer.selectedRange,
                epub.renderer.currentChapter.cfiBase
            ), note: JSON.stringify({
                note: this.refs.note.value,
                highlighted: epub.renderer.selectedRange.toString()
            }), created: Date.now()
        };
        
        request({
            url: URL + "api/books/" + this.props.book.id + "/note",
            data, method: "POST", success: (res) => {
                if (res.error) {
                    swal("Error", "Could not create note.", "error");
                }
                else {
                    const notes = this.props.book.notes.concat([data]);
                    
                    this.props.updateBook({ notes });
                    
                    // Ensure highlighted content in book is updated
                    this.props.onCycleHighlightMode();

                    this.props.onClose();
                }
            }
        });
    }

    render() {
        return (
            <div className="create-note">
                <cite className="highlighted-text">{
                    epub.renderer.selectedRange.toString()
                }</cite>
                
                <hr />
                
                <textarea className="note" ref="note" />
                
                <button className="btn-primary" onClick={this.onCreateNote}>
                    Create Note
                </button>
            </div>
        );
    }

}