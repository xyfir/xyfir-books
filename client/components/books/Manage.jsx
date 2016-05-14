import React from "react";
import Dropzone from "react-dropzone";

// Action creators
import { deleteFormat, incrementVersion } from "../../actions/creators/books";

// Modules
import spaceNeeded from "../../lib/request/space-needed";
import loadCovers from "../../lib/books/load-covers";
import loadBooks from "../../lib/books/load-from-api";
import request from "../../lib/request/";

// Components
import NavBar from "../misc/NavBar";

export default class ManageBook extends React.Component {

    constructor(props) {
        super(props);
        
        this.state = {
            id: window.location.hash.split('/')[2],
            editComments: false
        };
        
        this.onToggleEditComments = this.onToggleEditComments.bind(this);
        this.onDownloadMetadata = this.onDownloadMetadata.bind(this);
        this.onDeleteFormat = this.onDeleteFormat.bind(this);
        this.onSaveChanges = this.onSaveChanges.bind(this);
    }
    
    componentDidMount() {
        loadCovers();
    }
    
    onToggleEditComments() {
        this.setState({ editComments: !this.state.editComments });
    }
    
    onDownloadMetadata() {
        if (!navigator.onLine) {
            swal("Error", "This action requires internet connectivity", "error");
            return;
        }
        
        let search = "";
        
        // Get metadata using ISBN
        this.refs.identifiers.split(", ").forEach(id => {
            const t = id.split(':');
            
            if (t[0] == "isbn") search = "isbn=" + t[1];
        });
        
        // Get metadata using author/title
        if (search == "") {
            let search = "author=" + encodeURIComponent(this.refs.authors.value)
                + "&title=" + encodeURIComponent(this.refs.title.value);
        }
        
        let url = this.props.data.account.library.address + "library/"
            + this.props.data.account.library.id + "/books/"
            + this.state.id + "/metadata?" + search;
        
        request({url, dataType: "text", success: (res) => {
            if (res == '1') {
                swal("Error", "Could not find metadata", "error");
            }
            else {
                // res == [key, val, key, val, ...]
                res = res.split("   : ");
                
                let key = "";
                
                res.forEach((kv, i) => {
                    // Key
                    if (i % 2 == 0) {
                        key = kv.trim();
                    }
                    // Value
                    else {
                        kv = kv.trim();
                        
                        switch (key) {
                            case "Title":
                                return this.refs.title.value = kv;
                            case "Author(s)":
                                return this.refs.authors.value = kv;
                            case "Publisher":
                                return this.refs.publisher.value = kv;
                            case "Tags":
                                return this.refs.tags.value = kv;
                            case "Published":
                                return this.refs.pubdate = kv.split('T')[0];
                            case "Identifiers":
                                return this.refs.identifiers.value = kv;
                            case "Comments":
                                if (this.state.editComments)
                                    this.refs.comments.value = kv;
                                else
                                    this.refs.comments.innerHTML = kv;
                            default: return;
                        }
                    }
                });
            }
        }});
    }
    
    onDeleteFormat(f) {
        if (!navigator.onLine) {
            swal("Error", "This action requires internet connectivity", "error");
            return;
        }
        
        const url = this.props.data.account.library.address + "library/"
            + this.props.data.account.library.id + "/books/"
            + this.state.id + "/format/" + f;
            
        request({url, method: "DELETE", success: (res) => {
            if (res.error)
                swal("Error", "Could not delete format", "error");
            else
                this.props.dispatch(deleteFormat(this.state.id, f));
        }});
    }
    
    onUploadCover(files) {
        if (!navigator.onLine) {
            swal("Error", "This action requires internet connectivity", "error");
            return;
        }
        
        spaceNeeded(files[0].size, this.props.dispatch, (err, address) => {
            if (err) {
                swal("Error", "An unknown error occured", "error");
            }
            else {
                address = address === undefined
                    ? this.props.data.account.library.address : address;
        
                const url = address + "library/" + this.props.data.account.library.id
                    + "/books/" + this.state.id + "/cover"; 
                
                upload(url, "PUT", "cover", [files[0]], res => {
                    if (res.error) {
                        swal("Error", "Could not upload file", "error");
                    }
                    else {
                        let fr = new FileReader();
                        
                        // Convert image to base64 data url
                        fr.onload = () => {
                            const lfKey = "cover-" + this.state.id + "-"
                                + this.props.data.books.find(b => this.state.id == b.id)
                                    .versions.cover;
                            
                            localforage.setItem(lfKey, fr.result).then(img => {
                                fr = null;
                                
                                // Load new cover
                                document.querySelector("img.cover").src = "";
                                loadCovers();
                                
                                // Increment book.versions.cover
                                this.props.dispatch(incrementVersion(
                                    this.state.id, "cover"
                                ));
                            }).catch(err => window.location.reload());
                        };
                        fr.readAsDataURL(files[0]);
                    }
                });
            }
        });
    }
    
    onSaveChanges() {
        if (!navigator.onLine) {
            swal("Error", "This action requires internet connectivity", "error");
            return;
        }
        
        let data = {
            identifiers: this.refs.identifiers.value,
            author_sort: this.refs.author_sort.value,
            publisher: this.refs.publisher.value,
            timestamp: (new Date(this.refs.timestamp.value)).toISOString(),
            authors: this.refs.authors.value,
            pubdate: (new Date(this.refs.pubdate.value)).toISOString(),
            rating: this.refs.rating.value,
            title: this.refs.title.value,
            tags: this.refs.tags.value.split(", ")
        };
        
        if (this.refs.series.value != "") {
            data.series = this.refs.series.value;
            data.series_index = this.refs.series_index.value;
        }
        
        const url = "";
        
        // Send to library server
        request({url, method: "PUT", data: { data: JSON.stringify(data) }, success: (res) => {
            if (res.error) {
                swal("Error", "An unknown error occured", "error");
            }
            else {
                // Reload state.books and update local storage books
                loadBooks(this.props.data.account.library, this.props.dispatch);
            }
        }});
    }

    render() {
        const book = this.props.data.books.find(b => {
            this.state.id == b.id;
        });
        
        return (
            <div className="manage-book">
                <NavBar
                    home={true}
                    account={true}
                    title={`Manage - ${book.title}`} 
                    library={true}
                    settings={""}
                    books={true}
                />
                
                <section className="main">
                    <label>Title</label>
                    <input type="text" ref="title" defaultValue={book.title} />
                    
                    <label>Authors</label>
                    <input type="text" ref="authors" defaultValue={book.authors} />
                    <label>Author Sort</label>
                    <input type="text" ref="author_sort" defaultValue={book.author_sort} />
                    
                    <label>Series</label>
                    <input type="text" ref="series" defaultValue={book.series || ""} />
                    <label>Series Index</label>
                    <input type="number" ref="series_index" defaultValue={book.series_index || 1} />
                </section>
                
                <section className="cover">
                    <img className="cover" id={`cover-${book.id}`} />
                    
                    <Dropzone onDrop={this.onUploadCover}>
                        <button className="btn-primary btn-sm">
                            <span className="icon-upload" /> Upload Cover
                        </button>
                    </Dropzone>
                    <button className="btn-secondary btn-sm" onClick={
                        () => window.open("https://www.google.com/search?tbm=isch&q=" + book.title)
                    }>
                        <span className="icon-search" /> Search Web
                    </button>
                </section>
                
                <section className="other">
                    <label>Rating</label>
                    <input
                        type="number"
                        ref="rating"
                        defaultValue={book.rating || 0}
                        max="5"
                        step="0.5"
                    />
                    
                    <label>Tags</label>
                    <input type="text" ref="tags" defaultValue={book.tags.join(", ")} />
                    
                    <label
                        title="ISBN, Amazon, ... ids. Format: identifier_name:id,.."
                    >Identifiers</label>
                    <input type="text" ref="identifiers" defaultValue={book.identifiers} />
                    
                    <label>Added</label>
                    <input
                        type="date"
                        ref="timestamp"
                        defaultValue={(new Date(book.timestamp)).toISOString().split('T')[0]}
                    />
                    
                    <label>Published</label>
                    <input
                        type="date"
                        ref="pubdate"
                        defaultValue={book.pubdate ? book.pudate.split('T')[0] : ""}
                    />
                    
                    <label>Publisher</label>
                    <input type="text" ref="publisher" defaultValue={book.publisher || ""} />
                </section>
                
                <section className="download-metadata">
                    <button
                        className="btn-secondary btn-sm"
                        onClick={this.onDownloadMetadata}
                    >Download Metadata</button>
                    
                    <p>
                        We'll attempt to get this book's metadata from the internet using its authors and title, or ISBN.
                    </p>
                </section>
                
                <section className="comments">
                    {this.state.editComments ? (
                        <textarea
                            ref="comments"
                            className="comments-edit"
                            defaultValue={book.comments || ""}
                        />
                    ) : (
                        <div
                            ref="comments"
                            className="comments"
                            dangerouslySetInnerHTML={{__html: book.comments || ""}}
                        />
                    )}
                    
                    <a onClick={this.onToggleEditComments}>{
                        this.state.editComments
                            ? "Comments Preview" : "Edit Comments"
                    }</a>
                </section>
                
                <section className="formats">
                    <table className="formats">{
                        book.formats.map(format => {
                            format = format.split('.')[1].toUpperCase();
                            
                            return (
                                <tr>
                                    <td>{format}</td>
                                    <td><span
                                        className="icon-trash"
                                        onClick={this.onDeleteFormat.bind(this, format)}
                                    /></td>
                                </tr>
                            );
                        })
                    }</table>
                    
                    <a href={location.hash.replace("manage", "add-format")}>
                        Add Format
                    </a>
                </section>
                
                <button className="btn-primary" onClick={this.onSaveChanges}>
                    Save Changes
                </button>
            </div>
        );
    }

}