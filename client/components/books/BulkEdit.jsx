import React from "react";
import titleCase from "titlecase";

// Modules
import loadBooks from "lib/books/load-from-api";
import request from "lib/request/index";

// Constants
import { LIBRARY_URL } from "constants/config";

// Components
import NavBar from "../misc/NavBar";

export default class EditBooks extends React.Component {

    constructor(props) {
        super(props);
        
        this.state = {
            ids: window.location.hash.split('/')[2].split(','),
            status: ""
        };
        
        this.onSaveChanges = this.onSaveChanges.bind(this);
    }
    
    onSaveChanges() {
        if (!navigator.onLine) {
            swal("Error", "This action requires internet connectivity", "error");
            return;
        }
        
        this.setState({ status: "Allocating space on server" });
        
        const r = this.refs;

        const updateBook = (index) => {
            const id = this.state.ids[index];
            
            // All books updated
            if (id === undefined) {
                this.setState({ status: "" });
                swal("Action Complete", "", "success");
                
                // Update state.books and local storage
                loadBooks(
                    this.props.data.account.library,
                    this.props.dispatch
                );
                
                return;
            }
            
            const book = this.props.data.books.find(b => id == b.id);
            
            // Skip book or abort editing
            if (book === undefined) {
                if (r.abort_on_error.checked) {
                    this.setState({ status: `Could not find book with id '${id}'. Aborting...` });
                    return;
                }
                else {
                    this.setState({ status: `Could not find book with id '${id}'. Skipping...` });
                    updateBook(index + 1);
                    return;
                }
            }
            else {
                this.setState({ status: `Editing book '${book.title || id}'` });
            }
            
            // Build data object to send to server
            let data = {};
            
            // Swap authors / title
            if (r.author_title_swap.checked) {
                data.authors = book.title;
                data.title = book.authors;
            }
            // Set authors
            if (r.authors.value != "") {
                data.authors = r.authors.value;
            }
            // Format title
            if (r.title_format.checked) {
                data.title = titleCase(data.title || book.title);
            }
            // Rating
            if (r.rating.value != "") {
                data.rating = +r.rating.value;
                
                if (data.rating > 0) {
                    data.rating = data.rating / 2;
                }
            }
            // Publisher
            if (r.publisher.value != "") {
                data.publisher = r.publisher.value;
            }
            // Published
            if (r.published.value != "") {
                data.pubdate = (new Date(r.published.value)).toISOString();
            }
            // Set data.tags
            if (r.add_tags.value != "" || r.rem_tags.value != "") {
                data.tags = book.tags;
                
                // Add tags
                if (r.add_tags.value != "") {
                    data.tags = data.tags.concat(r.add_tags.value.split(", "));
                }
                // Remove tags
                if (r.rem_tags.value != "") {
                    const remove = r.rem_tags.value.toLowerCase().split(", ");
                    
                    data.tags = data.tags.filter(t1 => {
                        return remove.indexOf(t1.toLowerCase()) == -1;
                    });
                }
                
                data.tags = data.tags.join(", ");
            }
            // Clear tags
            if (r.clear_tags.checked) {
                data.tags = "";
            }
            // Set series
            if (r.series.value != "") {
                data.series = r.series.value;
            }
            // Clear series
            if (r.clear_series.checked) {
                data.series = "";
            }
            // Date added
            if (r.timestamp.value != "") {
                data.timestamp = (new Date(r.timestamp.value)).toISOString();
            }
            // Comments
            if (r.comments.value != "") {
                data.comments = r.comments.value;
            }
            
            this.setState({ status: "Sending new metadata to server" });
            
            const url = LIBRARY_URL + this.props.data.account.library
                + "/books/" + id + "/metadata";
            
            // Update book's metadata
            request({url, method: "PUT", data: { data: JSON.stringify(data) }, success: (res) => {
                if (res.error) {
                    if (r.abort_on_error.checked) {
                        this.setState({
                            status: `Error updating book '${data.title || book.title || id}'. Aborting...`
                        });
                        return;
                    }
                    else {
                        this.setState({
                            status: `Error updating book '${data.title || book.title || id}'.`
                        });
                        updateBook(index + 1);
                    }
                }
                else {
                    updateBook(index + 1);
                }
            }})
        };
        
        updateBook(0);
    }

    render() {
        return (
            <div className="edit-books">
                <NavBar
                    home={true}
                    account={true}
                    title={`Editing (${this.state.ids.length}) Books`} 
                    library={true}
                    settings={""}
                    books={true}
                />
                
                <div className="form">
                    <label>Authors</label>
                    <input type="text" ref="authors" />
                    
                    <span className="checkbox">
                        <input type="checkbox" ref="author_title_swap" />Swap Title / Authors
                    </span>
                    
                    <label>Author Sort</label>
                    <input type="text" ref="author_sort" />
                    
                    <hr />
                    
                    <label>Publisher</label>
                    <input type="text" ref="publisher" />
                    
                    <label>Published</label>
                    <input type="date" ref="published" />
                    
                    <hr />
                    
                    <label>Add Tags</label>
                    <input type="text" ref="add_tags" />
                    
                    <label>Remove Tags</label>
                    <input type="text" ref="rem_tags" />
                    <input type="checkbox" ref="clear_tags" />Clear Tags
                    
                    <hr />
                    
                    <label>Rating</label>
                    <input type="number" ref="rating" max="5" step="0.5" />
                    
                    <label>Series</label>
                    <input type="text" ref="series" />
                    <input type="checkbox" ref="clear_series" />Clear Series
                    
                    <label>Added</label>
                    <input type="date" ref="timestamp" />
                    
                    <label>Comments</label>
                    <textarea ref="comments" className="comments-edit" />
                    
                    <span className="checkbox">
                        <input type="checkbox" ref="title_format" />Convert Title to Title Case
                    </span>
                    
                    <span className="checkbox">
                        <input type="checkbox" ref="abort_on_error" />Stop Editing on Error
                    </span>
                    
                    <hr />
                    
                    <p><strong>Note:</strong> Fields left blank will not be changed</p>
                    
                    <button className="btn-primary" onClick={this.onSaveChanges}>
                        Save Changes
                    </button>
                    
                    <div className="status">{this.state.status ? (
                        <p>
                            <strong>Status:</strong> {this.state.status}
                        </p>
                    ) : (
                        <span />
                    )}</div>
                </div>
            </div>
        );
    }

}