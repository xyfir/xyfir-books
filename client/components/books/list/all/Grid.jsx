import React from "react";

// Modules
import findMatches from "../../../../lib/books/find-matching";
import loadCovers from "../../../../lib/books/load-covers";
import sortBooks from "../../../../lib/books/sort";
import toUrl from "../../../../lib/url/clean";

export default class GridList extends React.Component {

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
            <div className="list-grid">{
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
                            <a href={url}><img className="cover" id={`cover-${book.id}`} /></a>
                            
                            <div className="info">
                                <a className="title" href={url}>{book.title}</a>
                                <a className="authors" href={
                                    `#books/list/all?authors=${encodeURIComponent(book.authors)}`
                                }>{book.authors}</a>
                            </div>
                        </div>
                    );
                })
            }</div>
        );
    }

}