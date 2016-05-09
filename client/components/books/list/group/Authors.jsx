import React from "react";

// Components
import Search from "../../../misc/Search";

// Modules
import findListItems from "../../../../lib/books/find-list-items";

export default class ListAuthors extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        let authors = {/* 'authors': booksCount */};
        
        this.props.data.books.forEach(book => {
            if (authors[book.authors] === undefined)
                authors[book.authors] = 1;
            else
                authors[book.authors]++;
        });
        
        return (
            <div className="list-authors">
                <Search dispatch={this.props.dispatch} />
                <table className="list">{
                    findListItems(authors, this.props.data.search).map(author => {
                        return (
                            <tr>
                                <td><a href={`#books/list/all?author=${encodeURIComponent(author)}`}>
                                    {author}
                                </a></td>
                                <td>{authors[author]}</td>
                            </tr>
                        )
                    })
                }</table>
            </div>
        );
    }

}