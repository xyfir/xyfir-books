import React from "react";

// Action creators
import { deleteBooks } from "../../../../actions/creators/books";

// Constants
import { URL } from "../../../../constants/config";

// Modules
import findMatches from "../../../../lib/books/find-matching";
import loadCovers from "../../../../lib/books/load-covers";
import sortBooks from "../../../../lib/books/sort";
import request from "../../../../lib/request/";
import toUrl from "../../../../lib/url/clean";

export default class TableList extends React.Component {

    constructor(props) {
        super(props);
        
        this.state = {
            selected: [], sort: {
                field: "title", asc: true
            }
        };
    }
    
    componentDidUpdate() {
        if (this.state.selected.length)
            loadCovers(this.props.data.books, this.props.data.account.library);
    }
    
    onSelect(e, id) {
        // Select multiple items
        if (e.ctrlKey) {
            // Add item
            if (this.state.selected.indexOf(id) == -1)
                this.setState({ selected: this.state.selected.concat([id]) });
            // Remove item
            else
                this.setState({ selected: this.state.selected.filter(s => s != id) });
        }
        // Select single item
        else {
            this.setState({ selected: [id] });
        }
    }
    
    onDelete() {
        if (!navigator.onLine) {
            swal("No Internet Connection", "This action requires an internet connection", "error");
            return;
        }
        
        // Delete ids in state.selected
        swal({
            title: "Are you sure?",
            text: `Are you sure you want to delete (${this.state.selected.length}) book(s) from your library?`,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Delete"
        }, () => {
            request({
                url: URL + "api/books", method: "DELETE",
                data: { ids: this.state.selected.join(',') }, success: (res) => {
                    if (res.error) {
                        swal("Error", "Could not delete book(s)", "error");
                    }
                    else {
                        const deleteFromLocalStorage = (i) => {
                            // All deleted
                            if (this.state.selected[i] === undefined) {
                                this.props.dispatch(deleteBooks(this.state.selected));
                                this.setState({ selected: [] });
                            }
                            // Delete book at index i in selected[] from local storage
                            else {
                                const book = this.props.data.books.find(b => {
                                    return b.id == this.state.selected[i];
                                });
                                
                                // Remove cover
                                localforage.removeItem(`cover-${book.id}-${book.versions.cover}`).then(() => {
                                    // ** Delete book file stored via epub.js
                                    deleteFromLocalStorage(i + 1);
                                }).catch(err => deleteFromLocalStorage(i + 1));
                            }
                        };
                        
                        deleteFromLocalStorage(0);
                    }
                }
            });
        });
    }
    
    onSort(col) {
        // Flip state.sort.asc, retain field
        if (this.state.sort.field == col)
            this.setState({ sort: { field: col, asc: !this.state.sort.asc } });
        // Change state.sort.field, asc always true
        else
            this.setState({ sort: { field: col, asc: true } });
    }

    render() {
        let selectedBook = this.props.data.books.find(b => {
            return b.id == this.state.selected[this.state.selected.length - 1];
        });
        if (selectedBook !== undefined) {
            selectedBook.url = `${selectedBook.id}/${toUrl(selectedBook.authors)}/${toUrl(selectedBook.title)}`;
            
            if (selectedBook.identifiers === undefined)
                selectedBook.identifiers = "search:authors,search:title";
            else
                selectedBook.identifiers += ",search:authors,search:title";
        }
        
        return (
            <div className="list-table">
                <table>
                    <thead>
                        <tr>{
                            this.props.data.config.bookList.table.columns.map(col => {
                                return (
                                    <th
                                        onContextMenu={() => window.location.hash = "settings/book-list"}
                                        className={this.state.sort.field == col ? "sort-by" : ""}
                                        onClick={this.onSort.bind(this, col)}
                                    >{col.replace(/\b[a-z]/g, c => c.toUpperCase())}</th>
                                )
                            })
                        }</tr>
                    </thead>
                    <tbody>{
                        sortBooks(
                            findMatches(this.props.data.books, this.props.data.search),
                            this.state.sort.field, this.state.sort.asc
                        ).map(book => {
                            return (
                                <tr
                                    className={
                                        `book ${this.state.selected.indexOf(book.id) > -1 ? "selected" : ""}`
                                    }
                                    onClick={(e) => this.onSelect(e, book.id)}
                                >{
                                    this.props.data.config.bookList.table.columns.map(col => {
                                        switch (col) {
                                            case "added": return (
                                                <td className="added">{
                                                    (new Date(book.timestamp)).toLocaleDateString()
                                                }</td>
                                            );
                                            
                                            case "rating": return (
                                                <td className="rating">{
                                                    book.rating === undefined
                                                        ? "No Rating"
                                                        : <span>{book.rating}<span className="icon-star" /></span>
                                                }</td>
                                            );
                                            
                                            case "published": return (
                                                <td className="published">{
                                                    (new Date(book.pubdate)).toLocaleDateString()
                                                }</td>
                                            );
                                            
                                            case "series": return (
                                                <td className="series">{
                                                    book.series === undefined
                                                        ? "" : `${book.series} [${book.series_index}]`
                                                }</td>
                                            );
                                            
                                            default: return (
                                                <td className={col}>{book[col]}</td>
                                            );
                                        }
                                    })
                                }</tr>
                            );
                        })
                    }</tbody>
                </table>
                
                <div className="selected-book">
                    {this.state.selected.length ? (
                        <div className="controls">
                            {this.state.selected.length > 1 ? (<span />) : (
                                <a href={`#books/read/${selectedBook.url}`}>
                                    <span className="icon-eye" /> Read
                                </a>
                            )}
                            
                            <a onClick={this.onDelete}>
                                <span className="icon-trash" /> Delete
                            </a>
                            
                            {this.state.selected.length > 1 ? (
                                <a href={`#books/bulk-edit/${this.state.selected.join(',')}`}>
                                    <span className="icon-edit" /> Bulk Edit
                                </a>
                            ) : (
                                <a href={`#books/manage/${selectedBook.url}`}>
                                    <span className="icon-edit" /> Manage
                                </a>
                            )}
                            
                            {this.state.selected.length > 1 ? (<span />) : (
                                <a href={`#books/covert-format/${selectedBook.url}`}>
                                    <span className="icon-files" /> Add Format
                                </a>
                            )}
                        </div>
                    ) : <div />}
                    
                    <div className="info">
                        <a href={`#books/read/${selectedBook.url}`}>
                            <img className="cover" id={`cover-${selectedBook.id}`} />
                        </a>
                        
                        <span className="percent-complete">{selectedBook.percent_complete + "%"}</span>
                        <span className="word-count">{
                            selectedBook.word_count == 0 ? "" : Math.round(selectedBook.word_count / 1000) + "K"
                        }</span>
                        <span className="date-added">{
                            (new Date(selectedBook.timestamp)).toLocaleDateString()
                        }</span>
                        <span className="rating">
                            {!!(+selectedBook.rating) ? <span>{selectedBook.rating}</span> : ""}
                            {!!(+selectedBook.rating) ? <span className="icon-star" /> : ""}
                        </span>
                        
                        <hr />
                        
                        <dl>
                            <dt>Title</dt><dd>{selectedBook.title}</dd>
                            
                            <dt>Authors</dt><dd><a href={
                                `#books/list/all?authors=${encodeURIComponent(selectedBook.authors)}`
                            }>{selectedBook.authors}</a></dd>
                            
                            {selectedBook.series !== undefined ? (
                                <div>
                                    <dt>Series</dt>
                                    <dd>#{selectedBook.series_index} of <a href={
                                        `#books/list/all?series=${encodeURIComponent(selectedBook.series)}`
                                    }>{selectedBook.series}</a></dd>
                                </div>
                            ) : (<div />)}
                            
                            <dt>Published</dt>
                            <dd>{
                                (new Date(selectedBook.pubdate)).toLocaleDateString()
                            } by <a href={`#books/list/all?publisher=${selectedBook.publisher}`}>{
                                selectedBook.publisher
                            }</a></dd>
                            
                            <dt>Formats</dt>
                            <dd className="formats">{
                                selectedBook.formats(format => {
                                    const url = this.props.data.account.library.address + "library/"
                                        + this.props.data.account.library.id + "/files/"
                                        + selectedBook.cover.split('/').slice(-3).join('/');
                                    return (
                                        <a target="_blank" href={url}>{
                                            url.split('.')[1].toUpperCase()
                                        }</a>
                                    );
                                })
                            }</dd>
                            
                            <dt>Links</dt>
                            <dd className="links">{
                                selectedBook.identifiers.split(',').forEach(id => {
                                    id = id.split(':');
                                    
                                    switch (id[0]) {
                                        case "isbn": return (
                                            <a href={`http://www.abebooks.com/book-search/isbn/${id[1]}`}>
                                                ISBN ({id[1]})
                                            </a>
                                        );
                                        
                                        case "goodreads": return (
                                            <a href={`http://www.goodreads.com/book/show/${id[1]}`}>
                                                GoodReads
                                            </a>
                                        );
                                        
                                        case "mobi-asin":
                                        case "amazon": return (
                                            <a href={`http://www.amazon.com/dp/${id[1]}`}>
                                                Amazon
                                            </a>
                                        );
                                        
                                        case "google": return (
                                            <a href={`https://books.google.com/books/about/?id=${id[1]}`}>
                                                Google Books
                                            </a>
                                        );
                                        
                                        case "barnesnoble": return (
                                            <a href={`http://www.barnesandnoble.com/${id[1]}`}>
                                                Barnes & Noble
                                            </a>
                                        );
                                        
                                        default: return (<span />);
                                    }
                                })
                            }</dd>
                            
                            <dt>Tags</dt>
                            <dd className="tags">{
                                selectedBook.tags.map(tag => {
                                    return (
                                        <a href={`#books/list/all?tag=${encodeURIComponent(tag)}`}>{
                                            tag
                                        }</a>
                                    );
                                })
                            }</dd>
                            
                            <dt>Comments</dt>
                            <dd dangerouslySetInnerHTML={{__html: selectedBook.comments}} />
                        </dl>
                    </div>
                </div>
            </div>
        );
    }

}