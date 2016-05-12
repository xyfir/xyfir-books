import React from "react";
import Dropzone from "react-dropzone";

// Action creators
import { addFormat } from "../../actions/creators/books";

// Modules
import request from "../../lib/request/";
import upload from "../../lib/request/upload";

// Components
import NavBar from "../misc/NavBar";

export default class AddFormat extends React.Component {

    constructor(props) {
        super(props);
        
        this.state = {
            id: window.location.hash.split('/')[2]
        };
        
        this.onConvert = this.onConvert.bind(this);
        this.onUpload = this.onUpload.bind(this);
    }
    
    onConvert() {
        if (!navigator.onLine) {
            swal("Error", "This action requires internet connectivity", "error");
            return;
        }
        
        const url = this.props.data.account.library.address + "library/"
            + this.props.data.account.library.id + "/books/"
            + this.state.id + "/format/convert/"
            + this.refs.convertFrom.value + "/"
            + this.refs.convertTo.value;
        
        
        request({url, method: "POST", success: (res) => {
            if (res.error) {
                swal("Error", "Could not convert format", "error");
            }
            else {
                this.props.dispatch(addFormat(
                    this.state.id, this.refs.convertTo.value
                ));
                swal("Success", "Format added", "success");
            }
        }});
    }
    
    onUpload(files) {
        if (!navigator.onLine) {
            swal("Error", "This action requires internet connectivity", "error");
            return;
        }
        
        const url = this.props.data.account.library.address + "library/"
            + this.props.data.account.library.id + "/books/"
            + this.state.id + "/format"; 
        
        upload(url, "POST", "book", [files[0]], res => {
            if (res.error) {
                swal("Error", "Could not upload file", "error");
            }
            else {
                this.props.dispatch(addFormat(
                    this.state.id, this.refs.convertTo.value
                ));
                swal("Success", "Format added", "success");
            }
        });
    }

    render() {
        const book = this.props.data.find(b => this.state.id == b.id);
        const formats = book.formats.map(format => {
            return format.split('.')[1].toUpperCase();
        });
        
        return (
            <div className="add-format">
                <NavBar
                    back="#book/list/all"
                    home={true}
                    account={true}
                    title="Add Format"
                    library={true}
                    settings={""}
                    books={true}
                />
                
                <p>
                    <strong>Note:</strong> Only <a href="https://en.wikipedia.org/wiki/EPUB" target="_blank">EPUB</a> format ebooks can be read by Libyq's ebook reader.
                </p>
                
                <div className="upload">
                    <h1>Upload</h1>
                    <p>Add a format a new format for <strong>{book.title}</strong>. If you upload a format that already exists, the old file will be replaced.</p>
                    <p><strong>Current Available Formats:</strong> {formats.join(", ")}</p>
                    
                    <hr />
                    
                    <Dropzone onDrop={this.onUpload}>
                        Drag and drop ebook file or click box to choose file to upload.
                    </Dropzone>
                </div>
                
                <div className="convert">
                    <h1>Convert File</h1>
                    <p>Our system can attempt to automatically convert an already existing format to a different format. This process is not perfect, and can cause formatting and other issues.</p>
                    
                    <hr />
                    
                    <label>Convert From</label>
                    <select ref="convertFrom">{
                        formats.map(format => {
                            return <option value={format}>{format}</option>;
                        })
                    }</select>
                    
                    <label>Convert To</label>
                    <input type="text" ref="convertTo" placeholder="Format" />
                    
                    <button className="btn-secondary" onClick={this.onConvert}>Convert</button>
                </div>
            </div>
        );
    }

}