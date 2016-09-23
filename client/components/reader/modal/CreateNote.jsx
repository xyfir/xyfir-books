import React from "react";

// Modules
import request from "lib/request/index";

// Constants
import { URL } from "constants/config";

export default class CreateNote extends React.Component {

    constructor(props) {
        super(props);
        
        if (!navigator.onLine) {
            this.state = {
                error: true, message: "This feature requires internet access"
            };
        }
        else if (!!epub.renderer.selectedRange) {
            if (epub.renderer.selectedRange.toString().length < 10) {
                this.state = {
                    error: true, message: "Selected text must be at least 10 characters long"
                };
            }
            else {
                this.state = { erro: false };
            }
        }
        else {
            this.state = {
                error: true, message: "You must highlight text first to create a note."
            };
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
                    this.setState({
                        error: true, message: "An unknown error occurred"
                    });
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
        if (this.state.error) {
            return (
                <div className="create-note">
                    <p><strong>Error:</strong> {this.state.message}</p>
                </div>
            );
        }
        else {
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

}