import React from "react";

// Modules
import request from "../../lib/request/";

// Components
import NavBar from "../misc/NavBar";

export default class LibraryInfo extends React.Component {

    constructor(props) {
        super(props);
        
        const url = this.props.data.account.library.address + "library/"
            + this.props.data.account.library.id + "/size";
            
        this.state = { size: 0 };
        
        request({url, success: (res) => {
            if (res.error)
                this.setState({ size: -1 });
            else
                this.setState({ size: res.size });
        }});
    }

    render() {
        return (
            <div className="library-info">
                <NavBar
                    home={true}
                    account={true}
                    title="Library Info"
                    settings={""}
                    books={true}
                />
                
                <section className="info">
                    <p>
                        This information details the size and book count of your library in the cloud.
                        <br />
                        Locally stored size and book count may differ.
                    </p>
                    
                    <hr />
                    
                    <table>
                        <tr>
                            <th>Size</th>
                            <td>{
                                this.state.size == -1
                                    ? "Could not calculate size"
                                    : (this.state.size * 0.000001) + " MB"
                            }</td>
                        </tr>
                        <tr>
                            <th>Books</th>
                            <td>{this.props.data.books.length}</td>
                        </tr>
                    </table>
                </section>
                
                <hr />
                
                <section className="buttons">
                    <button
                        className="btn-secondary"
                        onClick={() => {
                            location.hash = "library/download";
                        }}
                    ><span className="icon-download" />Download</button>
                    <button
                        className="btn-secondary"
                        onClick={() => {
                            location.hash = "library/upload";
                        }}
                    ><span className="icon-upload" />Upload</button>
                </section>
            </div>
        );
    }

}