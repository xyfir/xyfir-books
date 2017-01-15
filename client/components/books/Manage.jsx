import React from "react";
import Dropzone from "react-dropzone";

// Modules
import loadCovers from "lib/books/load-covers";
import loadBooks from "lib/books/load-from-api";
import request from "lib/request/index";
import upload from "lib/request/upload";

// Components
import NavBar from "components/misc/NavBar";

// Constants
import { LIBRARY } from "constants/config";

// Action creators
import { deleteFormat, incrementVersion } from "actions/creators/books";

export default class ManageBook extends React.Component {

    constructor(props) {
        super(props);
        
        this.state = {
            id: window.location.hash.split('/')[2],
            downloadingMetadata: false,
            editComments: false,
            findCover: false,
            saving: false
        };
        
        this.onDownloadMetadata = this.onDownloadMetadata.bind(this);
        this.onDeleteFormat = this.onDeleteFormat.bind(this);
        this.onSaveChanges = this.onSaveChanges.bind(this);
        this.onUploadCover = this.onUploadCover.bind(this);
        this.onOpenClick = this.onOpenClick.bind(this);
    }
    
    componentDidMount() {
        loadCovers(this.props.data.books, this.props.data.account.library);
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
            search
                = "author=" + encodeURIComponent(this.refs.authors.value)
                + "&title=" + encodeURIComponent(this.refs.title.value);
        }
        
        let url = LIBRARY
            + this.props.data.account.library + "/books/"
            + this.state.id + "/metadata?" + search;
        
        request({url, dataType: "text"}, (res) => {
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
        });
    }
    
    onDeleteFormat(f) {
        if (!navigator.onLine) {
            swal("Error", "This action requires internet connectivity", "error");
            return;
        }
        
        const url = LIBRARY
            + this.props.data.account.library + "/books/"
            + this.state.id + "/format/" + f;
            
        request({url, method: "DELETE"}, (res) => {
            if (res.error)
                swal("Error", "Could not delete format", "error");
            else
                this.props.dispatch(deleteFormat(this.state.id, f));
        });
    }
    
    onUploadCover(files) {
        if (!navigator.onLine) {
            swal("Error", "This action requires internet connectivity", "error");
            return;
        }
        
        const url = LIBRARY + this.props.data.account.library
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
    
    onSaveChanges() {
        if (!navigator.onLine) {
            swal("Error", "This action requires internet connectivity", "error");
            return;
        }
        
        this.setState({ saving: true });
        
        let data = {
            identifiers: this.refs.identifiers.value,
            author_sort: this.refs.author_sort.value,
            publisher: this.refs.publisher.value,
            timestamp: (new Date(this.refs.timestamp.value)).toISOString(),
            authors: this.refs.authors.value,
            pubdate: (new Date(this.refs.pubdate.value)).toISOString(),
            rating: this.refs.rating.value,
            title: this.refs.title.value,
            tags: this.refs.tags.value
        };
        
        // Calibre doubles rating for some reason...
        if (data.rating > 0) {
            data.rating = data.rating / 2;
        }
        
        if (this.refs.series.value != "") {
            data.series = this.refs.series.value;
            data.series_index = this.refs.series_index.value;
        }

        if (this.refs.comments.value !== undefined) {
            data.comments = this.refs.comments.value;
        }
            
        const url = LIBRARY + this.props.data.account.library
            + "/books/" + this.state.id + "/metadata";

        // Send to library server
        request({
            url, method: "PUT", form: { data: JSON.stringify(data) }
        }, (res) => {
            this.setState({ saving: false });
            
            if (res.error) {
                swal("Error", "An unknown error occured", "error");
            }
            else {
                // Reload state.books and update local storage books
                loadBooks(
                    this.props.data.account.library,
                    this.props.dispatch
                );
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
                
                <section className="cover">
                    <Dropzone ref="dz" className="dropzone" onDrop={this.onUploadCover}>
                        <img className="cover" id={`cover-${book.id}`} />
                    </Dropzone>
                    
                    <button className="btn-primary" onClick={this.onOpenClick}>
                        <span className="icon-upload" /> Upload Cover
                    </button>
                    <button className="btn-secondary" onClick={
                        () => this.setState({ findCover: true })
                    }>
                        <span className="icon-search" /> Find Cover
                    </button>

                    {this.state.findCover ? (
                        <div className="find-cover">
                            <span
                                title="Close Book Cover Finder"
                                onClick={() => this.setState({ findCover: false })}
                                className="icon-close"
                            />
                            <iframe src={
                                "https://www.bing.com/images/search?q="
                                + book.authors + " " + book.title
                            }/>
                        </div>
                    ) : (
                        <div />
                    )}
                </section>
                
                <section className="other">
                    <label>Rating</label>
                    <input
                        type="number"
                        ref="rating"
                        defaultValue={book.rating || 0}
                        max="5"
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
                
                <section className="comments">
                    {this.state.editComments ? (
                        <div>
                            <label>Comments</label>
                            <span className="input-description">
                                Despite the name, the comments metadata field is typically used for the book's description.
                            </span>

                            <textarea
                                ref="comments"
                                className="comments-edit"
                                defaultValue={book.comments || ""}
                            />
                        </div>
                    ) : (
                        <div>
                            <div
                                ref="comments"
                                className="comments"
                                dangerouslySetInnerHTML={{
                                    __html: book.comments
                                        || "This book has no comments"
                                }}
                            />
                            
                            <button
                                className="btn-primary btn-sm"
                                onClick={() =>
                                    this.setState({ editComments: true })
                                }
                            >Edit Comments</button>
                        </div>
                    )}
                </section>
                
                <section className="formats">
                    <table className="formats">{
                        book.formats.map(format => {
                            format = format.split('.').slice(-1)[0].toUpperCase();
                            
                            return (
                                <tr>
                                    <td>{format}</td>
                                    <td><span
                                        className="icon-trash"
                                        onClick={() => this.onDeleteFormat(format)}
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
                
                <section>
                    <button className="btn-primary" onClick={this.onSaveChanges}>{
                        this.state.saving ? "Saving..." : "Save Changes"
                    }</button>
                </section>
            </div>
        );
    }

}