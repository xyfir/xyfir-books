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
        loadCovers();
    }
    
    componentDidUpdate() {
        loadCovers();
    }

    render() {
        return (
            <div className="list-compact">{
                sortBooks(
                    findMatches(this.props.data.books, this.props.data.search),
                    "title"
                ).map(book => {
                    const url = `#books/read/${book.id}/${toUrl(book.authors)}/${toUrl(book.title)}`;
                    
                    return (
                        <div
                            className="book"
                            onContextMenu={(e) => {
                                e.preventDefault();
                                window.location.hash = `#books/metadata/${book.id}`;
                            }}
                        >
                            <a href={url}><img className="cover" id={`cover-${book-id}`} /></a>
                            
                            <div className="info">
                                <a className="title" href={url}>{book.title}</a>
                                <a className="authors" href={
                                    `#books/list/all?authors=${encodeURIComponent(book.authors)}`
                                }>{book.authors}</a>
                                
                                <span className="percent-complete">{book.percent_complete + "%"}</span>
                                <span className="word-count">{
                                    book.word_count == 0 ? "" : Math.round(book.word_count / 1000) + "K"
                                }</span>
                                <span className="date-added">{
                                    (new Date(book.timestamp)).toLocaleDateString()
                                }</span>
                                <span className="rating">
                                    {!!(+book.rating) ? <span>{book.rating}</span> : ""}
                                    {!!(+book.rating) ? <span className="icon-star" /> : ""}
                                </span>
                            </div>
                        </div>
                    );
                })
            }</div>
        );
    }

}