import React from "react";
import Dropzone from "react-dropzone";

// Modules
import spaceNeeded from "../../lib/request/space-needed";
import loadCovers from "../../lib/books/load-covers";
import loadBooks from "../../lib/books/load-from-api";
import request from "../../lib/request/";
import upload from "../../lib/request/upload";

// Components
import NavBar from "../misc/NavBar";

// Action creators
import { deleteFormat, incrementVersion } from "../../actions/creators/books";

export default class ManageBook extends React.Component {

    constructor(props) {
        super(props);
        
        this.state = {
            id: window.location.hash.split('/')[2],
            downloadingMetadata: false,
            editComments: false
        };
        
        this.onToggleEditComments = this.onToggleEditComments.bind(this);
        this.onDownloadMetadata = this.onDownloadMetadata.bind(this);
        this.onDeleteFormat = this.onDeleteFormat.bind(this);
        this.onSaveChanges = this.onSaveChanges.bind(this);
        this.onUploadCover = this.onUploadCover.bind(this);
        this.onOpenClick = this.onOpenClick.bind(this);
    }
    
    componentDidMount() {
        loadCovers(this.props.data.books, this.props.data.account.library);
    }
    
    onToggleEditComments() {
        this.setState({ editComments: !this.state.editComments });
    }
    
    onDownloadMetadata() {
        if (!navigator.onLine) {
            swal("Error", "This action requires internet connectivity", "error");
            return;
        }
        
        this.setState({ downloadingMetadata: true });
        
        let search = "";
        
        // Get metadata using ISBN
        this.refs.identifiers.value.split(", ").forEach(id => {
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
                this.setState({ downloadingMetadata: false });
                swal("Error", "Could not find metadata", "error");
            }
            else {
                res = res.split("\n");
                
                res.forEach((kv, i) => {
                    kv = kv.split("   : ");
                    kv[1] = kv[1].trim();
                        
                    switch (kv[0].trim()) {
                        case "Title":
                            return this.refs.title.value = kv[1];
                        case "Author(s)":
                            return this.refs.authors.value = kv[1];
                        case "Publisher":
                            return this.refs.publisher.value = kv[1];
                        case "Tags":
                            return this.refs.tags.value = kv[1];
                        case "Published":
                            return this.refs.pubdate.value = kv[1].split('T')[0];
                        case "Identifiers":
                            return this.refs.identifiers.value = kv[1];
                        case "Comments":
                            // Comments can have newlines and comments is always last field
                            const comments = [kv[1]].concat(res.splice(i + 1)).join(' ');
                            if (this.state.editComments)
                                this.refs.comments.value = comments;
                            else
                                this.refs.comments.innerHTML = comments;
                        default: return;
                    }
                });
                
                this.setState({ downloadingMetadata: false });
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
                                + this.props.data.books.find(b => {
                                    return this.state.id == b.id;
                                }).versions.cover;
                            
                            localforage.setItem(lfKey, fr.result).then(img => {
                                // Load new cover
                                document.querySelector("img.cover").src = img;
                                
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
        
        spaceNeeded(1000000, this.props.dispatch, (err, address) => {
            if (err) {
                swal("Error", "An unknown error occured", "error");
            }
            else {
                address = address === undefined
                    ? this.props.data.account.library.address : address;
                    
                const url = address + "library/" + this.props.data.account.library.id
                    + "/books/" + this.state.id + "/metadata";
        
                // Send to library server
                request({url, method: "PUT", data: { data: JSON.stringify(data) }, success: (res) => {
                    if (res.error) {
                        swal("Error", "An unknown error occured", "error");
                    }
                    else {
                        // Reload state.books and update local storage books
                        loadBooks(
                            Object.assign({}, this.props.data.account.library, { address }),
                            this.props.dispatch
                        );
                    }
                }});
            }
        });
    }
    
    onOpenClick() {
        this.refs.dz.open();
    }

    render() {
        const book = this.props.data.books.find(b => {
            return this.state.id == b.id;
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
                
                <hr />
                
                <section className="cover">
                    <Dropzone ref="dz" className="dropzone" onDrop={this.onUploadCover}>
                        <img className="cover" id={`cover-${book.id}`} />
                    </Dropzone>
                    
                    <button className="btn-primary" onClick={this.onOpenClick}>
                        <span className="icon-upload" /> Upload Cover
                    </button>
                    <button className="btn-secondary" onClick={
                        () => window.open(
                            "https://www.google.com/search?tbm=isch&q="
                            + book.authors + " " + book.title
                        )
                    }>
                        <span className="icon-search" /> Find Cover
                    </button>
                </section>
                
                <hr />
                
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
                        defaultValue={book.pubdate ? book.pubdate.split('T')[0] : ""}
                    />
                    
                    <label>Publisher</label>
                    <input type="text" ref="publisher" defaultValue={book.publisher || ""} />
                </section>
                
                <hr />
                
                <section className="download-metadata">
                    <button
                        className="btn-secondary"
                        onClick={this.onDownloadMetadata}
                    >Download Metadata</button>
                    
                    <p>{this.state.downloadingMetadata ? (
                        "Attempting to find metadata... This can take up to 30 seconds."
                    ) : (
                        "We'll attempt to get this book's metadata from the internet using its authors and title, or ISBN."
                    )}</p>
                </section>
                
                <hr />
                
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
                            dangerouslySetInnerHTML={{
                                __html: book.comments || "This book has no comments"
                            }}
                        />
                    )}
                    
                    <button
                        className="btn-primary btn-sm"
                        onClick={this.onToggleEditComments}
                    >{
                        this.state.editComments
                            ? "Preview Comments" : "Edit Comments"
                    }</button>
                </section>
                
                <hr />
                
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
                                        title={`Delete Format (${format})`}
                                    /></td>
                                </tr>
                            );
                        })
                    }</table>
                    
                    <a href={location.hash.replace("manage", "add-format")}>
                        Add Format
                    </a>
                </section>
                
                <hr />
                
                <button className="btn-primary" onClick={this.onSaveChanges}>
                    Save Changes
                </button>
            </div>
        );
    }

}