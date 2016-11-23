import React from "react";

// Components
import Pagination from "components/misc/Pagination";

// Modules
import findMatches from "lib/books/find-matching";
import loadCovers from "lib/books/load-covers";
import parseQuery from "lib/url/parse-hash-query";
import sortBooks from "lib/books/sort";
import toUrl from "lib/url/clean";

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
        let q = parseQuery(), books =
            sortBooks(
                findMatches(
                    this.props.data.books, this.props.data.search.query
                ), "title", true
            ), booksCount = books.length;
        books = books.splice((this.props.data.search.page - 1) * 25, 25);

        return (
            <div>
                <div className="list-compact">{
                    books.map(book => {
                        const url = "/" + book.id + "/" + toUrl(book.authors)
                            + "/" + toUrl(book.title);
                        
                        return (
                            <div
                                className="book"
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    window.location.hash = `#books/manage${url}`;
                                }}
                            >
                                <a href={`#books/read${url}`}>
                                    <img
                                        className="cover"
                                        id={`cover-${book.id}`}
                                    />
                                </a>
                                
                                <div className="info">
                                    <a
                                        className="title"
                                        href={`#books/read${url}`}
                                    >{book.title}</a>
                                    
                                    <a className="authors" href={
                                        `#books/list/all?search=1&authors=${
                                            encodeURIComponent(book.authors)
                                        }`
                                    }>{book.authors}</a>
                                    
                                    <span className="percent-complete">{
                                        book.percent_complete + "%"
                                    }</span>
                                    {book.word_count > 0 ? (
                                        <span className="word-count">{
                                            Math.round(book.word_count / 1000)
                                        }K</span>
                                    ) : (
                                        <span />
                                    )}
                                    <span className="date-added">{
                                        (new Date(book.timestamp))
                                            .toLocaleDateString()
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

                <Pagination
                    itemsPerPage={25}
                    dispatch={this.props.dispatch}
                    items={booksCount} 
                    data={this.props.data}
                />
            </div>
        );
    }

}