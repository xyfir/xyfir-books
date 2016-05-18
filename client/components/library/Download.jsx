import React from "react";

// Modules
import download from "../../lib/request/download";

// Components
import NavBar from "../misc/NavBar";

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
        
        const url = this.props.data.account.library.address + "library/"
            + this.props.data.account.library.id + "/files/";
        
        const downloadBook = (index) => {
            const book = this.props.data.books[index];
            
            // All books downloaded
            if (book === undefined) {
                // Download metadata.db
                download(url + "metadata.db", res => {
                    zip.file("metadata.db", res, { binary: true });
                    
                    zip.generateAsync({ type: "blob" }).then(b => {
                        saveAs(b, "Library - " + Date.now());
                        zip = null;
                    });
                });
            }
            // Download next book
            else {
                let file = book.cover.split('/').slice(-3);
                
                // Download cover                    
                download(url + file.join('/'), res => {
                    zip.file(file, res, { binary: true });
                    
                    // Download metadata.opf
                    file[2] = "metadata.opf";
                    
                    download(url + file.join('/'), res => {
                        zip.file(file, res);
                        
                        const callDownloadBook = true;
                        
                        // Download formats
                        book.formats.forEach(format => {
                            const f = format.split('/').slice(-3).join('/');
                            
                            download(url + f, res => {
                                zip.file(f, res, { binary: true });
                                
                                if (callDownloadBook) {
                                    downloadBook(index + 1);
                                    callDownloadBook = false;
                                }
                            });
                        });
                    });
                });
            }
        };
        
        downloadBook(0);
    }

    render() {
        return (
            <div className="library-download">
                <NavBar
                    home={true}
                    account={true}
                    title="Library - Download"
                    library={true}
                    settings={""}
                    books={true}
                />
                
                <section className="">
                    <h2>Download Library</h2>
                    <p>
                        Download your entire library in a zip file. The downloaded library will be completely compatible with <a target="_blank" href="https://calibre-ebook.com/">Calibre</a>.
                    </p>
                    
                    <hr />
                    
                    {this.state.status == "" ? (
                        <button onClick="btn-primary" onClick={this.onDownload}>Download</button>
                    ) : (
                        <span className="status">{this.state.status}</span>
                    )}
                </section>
            </div>
        );
    }

}