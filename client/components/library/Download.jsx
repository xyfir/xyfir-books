import React from "react";
import { saveAs } from "file-saver";

// Modules
import download from "../../lib/request/download";

// Components
import NavBar from "../misc/NavBar";

// Constants
import { PATH_SEPARATOR } from "../../constants/config";

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
                this.setState({ status: "Downloading library database" });
                
                // Download metadata.db
                download(url + "metadata.db", res => {
                    zip.file("metadata.db", res, { binary: true });
                    
                    this.setState({ status: "Saving zip file" });
                    
                    zip.generateAsync({ type: "blob" }).then(b => {
                        saveAs(b, "Library - " + Date.now() + ".zip");
                        zip = null;
                        
                        this.setState({ status: "" });
                    });
                });
            }
            // Download next book
            else {
                let file = book.cover.split(PATH_SEPARATOR).slice(-3);
                
                this.setState({
                    status: `Downloading book (${index + 1}/${this.props.data.books.length})`
                });
                
                // Download cover                    
                download(url + file.join('/'), res => {
                    zip.file(file.join('/'), res, { binary: true });
                    
                    // Download metadata.opf
                    file[2] = "metadata.opf";
                    
                    download(url + file.join('/'), res => {
                        zip.file(file.join('/'), res);
                        
                        // Download formats
                        book.formats.forEach(format => {
                            const f = format.split(PATH_SEPARATOR).slice(-3).join('/');
                            
                            download(url + f, res => {
                                zip.file(f, res, { binary: true });
                                
                                downloadBook(index + 1);
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
                    title="Download Library"
                    library={true}
                    settings={""}
                    books={true}
                />
                
                <section className="">
                    <p>
                        Download your entire library in a zip file. The downloaded library will be completely compatible with <a target="_blank" href="https://calibre-ebook.com/">Calibre</a>.
                    </p>
                    
                    <hr />
                    
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