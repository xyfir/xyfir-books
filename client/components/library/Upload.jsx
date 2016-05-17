import React from "react";
import Dropzone from "react-dropzone";

// Modules
import loadBooksFromApi from "../../lib/books/load-from-api";
import spaceNeeded from "../../lib/request/space-needed";
import upload from "../../lib/request/upload";

// Components
import NavBar from "../misc/NavBar";

export default class UploadLibrary extends React.Component {

    constructor(props) {
        super(props);
        
        this.onUpload = this.onUpload.bind(this);
    }
    
    onUpload(files) {
        if (!navigator.onLine) {
            swal("Error", "This action requires internet connectivity", "error");
            return;
        }
        
        if (files[0].type != "application/zip") {
            swal("Invalid File", "You can only upload libraries in a zip file", "error");
            return;
        }
        
        spaceNeeded(files[0].size, this.props.dispatch, (err, address) => {
            if (err) {
                swal("Error", "An unknown error occured", "error");
            }
            else {
                address = address === undefined
                    ? this.props.data.account.library.address : address;
        
                const url = address + "library/"
                    + this.props.data.account.library.id + "/upload"; 
                
                upload(url, "POST", "lib", [files[0]], res => {
                    if (res.error) {
                        swal("Error", "Could not upload library", "error");
                    }
                    else {
                        swal(
                            "Success",
                            "Library uploaded successfully. Reloading library...",
                            "success"
                        );
                        
                        loadBooksFromApi(address, this.props.dispatch);
                    }
                });
            }
        });
    }

    render() {
        return (
            <div className="library-upload">
                <NavBar
                    home={true}
                    account={true}
                    title="Library - Upload"
                    library={true}
                    settings={""}
                    books={true}
                />
                
                <section>
                    <h2>Upload Library</h2>
                    <p>
                        Here you can upload an entire ebook library instead of individual ebook files.
                        <br />
                        Only <a target="_blank" href="https://calibre-ebook.com/">Calibre</a> libraries are accepted.
                        <br /> 
                        The library must be zipped at the library's root folder. This means when you look inside the zip file you should see folders for all of the authors in your library and then your library's <em>metadata.db</em> database file.
                        <br />
                        Library zip file size is limited to 500 MB.
                        <br />
                        If you already have books in your library stored in the cloud they <strong>will</strong> be deleted. Uploading a library completely erases your old one.
                    </p>
                    
                    <Dropzone onDrop={this.onUpload}>
                        Drag and drop library zip file or click box to choose file to upload.
                    </Dropzone>
                </section>
            </div>
        );
    }

}