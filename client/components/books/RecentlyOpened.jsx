import React from "react";

// Modules
import loadCovers from "../../lib/books/load-covers";
import sortBooks from "../../lib/books/sort";
import toUrl from "../../lib/url/clean";

// Components
import NavBar from "../misc/NavBar";

export default class RecentlyOpened extends React.Component {

    constructor(props) {
        super(props);
        
        this.state = { infoView: 1 };
        
        this.onToggleView = this.onToggleView.bind(this);
    }
    
    componentDidMount() {
        loadCovers(this.props.data.books, this.props.data.account.library);
    }
    
    componentDidUpdate() {
        loadCovers(this.props.data.books, this.props.data.account.library);
    }
    
    onToggleView() {
        this.setState({ infoView: this.state.infoView == 1 ? 2 : 1 });
    }

    render() {
        return (
            <div className="recently-opened">
                <NavBar
                    account={true}
                    title="Recently Opened"
                    library={true}
                    settings={""}
                    books={true}
                />
                
                <div className="books">{
                    sortBooks(this.props.data.books, "last_read").reverse().slice(-4).map(book => {
                        const url = `/${book.id}/${toUrl(book.authors)}/${toUrl(book.title)}`;
                        
                        return (
                            <div
                                className="book"
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    window.location.hash = `#books/manage${url}`;
                                }}
                            >
                                <a href={`#books/read${url}`}><img className="cover" id={`cover-${book.id}`} /></a>
                                
                                {this.state.infoView == 1 ? (
                                    <div className="info">
                                        <a className="title" href={`#books/read${url}`}>{book.title}</a>
                                        
                                        <a className="authors" href={
                                            `#books/list/all?authors=${encodeURIComponent(book.authors)}`
                                        }>{book.authors}</a>
                                        <a className="icon-more" title="More" onClick={this.onToggleView} />
                                    </div>
                                ) : (
                                    <div className="info">
                                        <span className="percent-complete">{book.percent_complete + "%"}</span>
                                        <span className="word-count">{
                                            book.word_count == 0 ? "" : Math.round(book.word_count / 1000) + "K"
                                        }</span>
                                        
                                        <span className="last-read">Last read on {
                                            (new Date(book.last_read)).toLocaleDateString()
                                        }</span>
                                        
                                        <a
                                            href={`#books/manage${url}`}
                                            className="icon-edit"
                                            title="View / Edit Metadata"
                                        />
                                        <a className="icon-more" title="More" onClick={this.onToggleView} />
                                    </div>
                                )}
                            </div>
                        );
                    })
                }</div>
            </div>
        );
    }

}