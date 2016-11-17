import React from "react";
import { saveAs } from "file-saver";

// Modules
import download from "lib/request/download";

// Components
import NavBar from "../misc/NavBar";

// Constants
import { LIBRARY_URL } from "constants/config";

export default class DownloadLibrary extends React.Component {

    constructor(props) {
        super(props);
        
        this.state = { status: "" };
        
        this.onDownload = this.onDownload.bind(this);
    }
    
    onDownload() {
        if (!navigator.onLine) {
            swal("Error", "This action requires internet connectivity", "error");
            return;
        }
        
        let zip = new JSZip;
        
        const url = LIBRARY_URL + "files/" + this.props.data.account.library + "/";
        
        const downloadBook = (index) => {
            const book = this.props.data.books[index];
            
            // All books downloaded
            if (book === undefined) {
                this.setState({ status: "Downloading library database" });
                
                // Download metadata.db
                download(url + "metadata.db", res => {
                    zip.file("metadata.db", res, { binary: true });
                    
                    this.setState({ status: "Saving zip file" });
                    
                    let b = zip.generate({});

                    saveAs(
                        this._base64ToBlob(b, "application/zip"),
                        "Library - " + Date.now() + ".zip"
                    );
                    zip = null, b = null;
                        
                    this.setState({ status: "" });
                }, true);
            }
            // Download next book
            else {
                let file = book.cover.split('/');
                
                this.setState({
                    status: `Downloading book (${
                        index + 1}/${this.props.data.books.length
                    })`
                });
                
                // Download cover                    
                download(url + file.join('/'), res => {
                    zip.file(file.join('/'), res, {binary: true});
                    
                    // Download metadata.opf
                    file[2] = "metadata.opf";
                    
                    download(url + file.join('/'), res => {
                        zip.file(file.join('/'), res, {binary: true});
                        
                        // Download formats
                        book.formats.forEach(format => {
                            download(url + format, res => {
                                zip.file(format, res, {binary: true});
                                
                                downloadBook(index + 1);
                            }, true);
                        });
                    }, true);
                }, true);
            }
        };
        
        downloadBook(0);
    }

    _base64ToBlob(base64Data, contentType) {
        contentType = contentType || '';
        var sliceSize = 1024;
        var byteCharacters = atob(base64Data);
        var bytesLength = byteCharacters.length;
        var slicesCount = Math.ceil(bytesLength / sliceSize);
        var byteArrays = new Array(slicesCount);

        for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
            var begin = sliceIndex * sliceSize;
            var end = Math.min(begin + sliceSize, bytesLength);

            var bytes = new Array(end - begin);
            for (var offset = begin, i = 0 ; offset < end; ++i, ++offset) {
                bytes[i] = byteCharacters[offset].charCodeAt(0);
            }
            byteArrays[sliceIndex] = new Uint8Array(bytes);
        }
        return new Blob(byteArrays, { type: contentType });
    }

    render() {
        return (
            <div className="library-download">
                <NavBar
                    home={true}
                    account={true}
                    title="Download Library"
                    library={true}
                    settings={""}
                    books={true}
                />
                
                <section className="info">
                    <p>
                        Download your entire library in a zip file. The downloaded library will be completely compatible with <a target="_blank" href="https://calibre-ebook.com/">Calibre</a>.
                    </p>
                </section>

                <section className="download">                    
                    {this.state.status == "" ? (
                        <button className="btn-primary" onClick={this.onDownload}>
                            Download
                        </button>
                    ) : (
                        <span className="status">{this.state.status}</span>
                    )}
                </section>
            </div>
        );
    }

}