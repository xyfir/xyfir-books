import React from "react";
import Dropzone from "react-dropzone";

// Modules
import loadBooksFromApi from "../../lib/books/load-from-api";
import spaceNeeded from "../../lib/request/space-needed";
import upload from "../../lib/request/upload";

// Components
import NavBar from "../misc/NavBar";

export default class UploadBooks extends React.Component {

    constructor(props) {
        super(props);
        
        this.state = { uploading: false };
        
        this.onUpload = this.onUpload.bind(this);
    }
    
    onUpload(files) {
        if (!navigator.onLine) {
            swal("Error", "This action requires internet connectivity", "error");
            return;
        }
        
        if (this.state.uploading)
            return;
        else
            this.setState({ uploading: true });
        
        // Determine space needed on storage server
        let bytes = 0; files.forEach(f => bytes += f.size);
        
        if (bytes > 5000001 || files.length > 20) {
            swal("Error", "Too many or too large of files. Limit 20 files / 500MB", "error");
            this.setState({ uploading: false });
            return;
        }
        
        spaceNeeded(bytes, this.props.dispatch, (err, address) => {
            if (err) {
                swal("Error", "An unknown error occured", "error");
                this.setState({ uploading: false });
            }
            else {
                address = address === undefined
                    ? this.props.data.account.library.address : address; 
                
                const url = address + "library/" + this.props.data.account.library.id
                    + "/books";
                
                upload(url, "POST", "book", files, res => {
                    this.setState({ uploading: false });
                    
                    if (res.error) {
                        swal("Error", "Could not upload file(s)", "error");
                    }
                    else {
                        swal("Success", "Book(s) uploaded successfully. Reloading library...", "success");
                        
                        // Reload state.books from API
                        loadBooksFromApi(
                            Object.assign(
                                {}, this.props.data.account.library, { address }
                            ), this.props.dispatch
                        );
                    }
                });
            }
        });
    }

    render() {
        return (
            <div className="upload-books">
                <NavBar
                    home={true}
                    account={true}
                    title="Upload Books"
                    library={true}
                    settings={""}
                    books={true}
                />
                
                <p>
                    Upload ebooks to add to your library. Our system will automatically attempt to extract metadata (title, authors, ...) from the ebook files. Each book's metadata can be viewed and modified after upload.
                </p>
                <p>
                    <strong>Note:</strong> Only <a href="https://en.wikipedia.org/wiki/EPUB" target="_blank">EPUB</a> format ebooks can be read by Libyq's ebook reader.
                </p>
                
                <hr />
                
                <Dropzone onDrop={this.onUpload} className="dropzone">{
                    this.state.uploading ? (
                        "Uploading file(s), please wait..."
                    ) : (
                        "Drag and drop ebook files or click box to choose files to upload."
                    )
                }</Dropzone>
            </div>
        );
    }

}