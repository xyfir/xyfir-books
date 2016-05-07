import React from "react";

// Components
import Search from "../../misc/Search";

// Modules
import findListItems from "../../../lib/books/findMatches";

export default class AuthorSort extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        let authorSort = {/* 'author_sort': booksCount */};
        
        this.props.data.books.forEach(book => {
            if (authorSort[book.author_sort] === undefined)
                authorSort[book.author_sort] = 1;
            else
                authorSort[book.author_sort]++;
        });
        
        <div className="list-author-sort">
            <Search dispatch={this.props.dispatch} />
            <table className="list">{
                findListItems(authorSort, this.props.data.search).map(author => {
                    return (
                        <tr>
                            <td><a href={`#books/list/author-sort/${author}`}>{author}</a></td>
                            <td>authorSort[author]</td>
                        </tr>
                    )
                })
            }</table>
        </div>
    }

}