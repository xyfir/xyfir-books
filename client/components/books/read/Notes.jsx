import React from "react";

// Modules
import request from "../../../lib/request/";

// Constants
import { URL } from "../../../constants/config";

export default class Notes extends React.Component {

    constructor(props) {
        super(props);
        
        this.state = { view: -1 };
        
        this.onDeleteNote = this.onDeleteNote.bind(this);
        this.onGoToNote = this.onGoToNote.bind(this);
    }

    onViewNote(index) {
        this.setState({ view: index });
    }
    
    onGoToNote() {
        epub.gotoCfi(
            this.props.book.notes[this.state.view].cfi
        );
    }
    
    onDeleteNote() {
        const cfi = this.props.book.notes[
            this.state.view
        ].cfi;
        
        request({
            url: URL + "api/books/" + this.props.book.id + "/note",
            method: "DELETE", data: { cfi }, success: (res) => {
                if (res.error) {
                    swal("Error", "Could not delete note.", "error");
                }
                else {
                    this.setState({ view: -1 });
                    this.props.updateBook({
                        notes: this.props.book.notes.filter(n => cfi != n.cfi)
                    });
                    this.props.highlightNotes();
                }
            }
        })
    }

    render() {
        if (this.state.view == -1) return (
            <ul className="notes">{
                this.props.book.notes.map((note, i) => {
                    const content = JSON.parse(note.note);
                    
                    return (
                        <li>
                            <a onClick={this.onViewNote.bind(this, i)}>
                                Note #{this.props.book.notes.length - i}
                            </a>
                            <span className="created">
                                Created {(new Date(note.created).toLocaleString())}
                            </span>
                            <span className="highlighted-text">{
                                content.highlighted.length > 50
                                ? content.highlighted.substr(0, 47) + "..."
                                : content.highlighted
                            }</span>
                            <span className="note-content">{
                                content.note.length > 50
                                ? content.note.substr(0, 47) + "..."
                                : content.note
                            }</span>
                        </li>
                    );
                })
            }</ul>
        )
        else {
            const content = JSON.parse(this.props.book.notes[this.state.view].note); 
            
            return (
                <div className="notes">
                    <span
                        className="icon-back"
                        onClick={this.onViewNote.bind(this, -1)}
                        title="Back to Notes"
                    />
                    
                    <h2>Highlighted Text</h2>
                    <cite className="highlighted-text">{content.highlighted}</cite>
                    
                    <hr />
                    
                    <h2>Note</h2>
                    <p className="note-content">{content.note}</p>
                    
                    <hr />
                    
                    <button className="btn-secondary" onClick={this.onGoToNote}>
                        Go To Note
                    </button>
                    <button className="btn-danger" onClick={this.onDeleteNote}>
                        Delete
                    </button>
                </div>
            );
        }
    }

}