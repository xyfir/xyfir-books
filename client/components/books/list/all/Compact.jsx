import React from "react";

// Modules
import findMatches from "../../../../lib/books/find-matching";
import loadCovers from "../../../../lib/books/load-covers";
import sortBooks from "../../../../lib/books/sort";
import toUrl from "../../../../lib/url/clean";

export default class CompactList extends React.Component {

    constructor(props) {
        super(props);
    }
    
    componentDidMount() {
        loadCovers(this.props.data.books, this.props.data.account.library);
    }
    
    componentDidUpdate() {
        loadCovers(this.props.data.books, this.props.data.account.library);
    }

    render() {
        return (
            <div className="list-compact">{
                sortBooks(
                    findMatches(this.props.data.books, this.props.data.search),
                    "title"
                ).map(book => {
                    const url = `/${book.id}/${toUrl(book.authors)}/${toUrl(book.title)}`;
                    
                    return (
                        <div
                            className="book"
                            onContextMenu={(e) => {
                                e.preventDefault();
                                window.location.hash = `#books/manage${url}`;
                            }}
                        >
                            <a href={`#books/read${url}`}>
                                <img className="cover" id={`cover-${book.id}`} />
                            </a>
                            
                            <div className="info">
                                <a className="title" href={`#books/read${url}`}>{book.title}</a>
                                <a className="authors" href={
                                    `#books/list/all?authors=${encodeURIComponent(book.authors)}`
                                }>{book.authors}</a>
                                
                                <span className="percent-complete">{book.percent_complete + "%"}</span>
                                {book.word_count > 0 ? (
                                    <span className="word-count">{
                                       Math.round(book.word_count / 1000) + "K"
                                    }</span>
                                ) : (
                                    <span />
                                )}
                                <span className="date-added">{
                                    (new Date(book.timestamp)).toLocaleDateString()
                                }</span>
                                {!!(+book.rating) ? (
                                    <span className="rating">
                                        <span>{book.rating}</span>
                                        <span className="icon-star" />
                                    </span>
                                ) : (
                                    <span />
                                )}
                            </div>

                            <div className="controls">
                                <a
                                    href={`#books/manage${url}`}
                                    className="icon-edit"
                                >Manage</a>
                            </div>
                        </div>
                    );
                })
            }</div>
        );
    }

}