import React from "react";

// Components
import Search from "../../../misc/Search";

// Modules
import findListItems from "../../../../lib/books/find-list-items";

export default class ListAuthorSort extends React.Component {

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
        
        return (
            <div className="list-author-sort">
                <Search dispatch={this.props.dispatch} />
                <table className="list">{
                    findListItems(authorSort, this.props.data.search).map(author => {
                        return (
                            <tr>
                                <td><a href={`#books/list/all?author_sort=${encodeURIComponent(author)}`}>
                                    {author}
                                </a></td>
                                <td>{authorSort[author]}</td>
                            </tr>
                        )
                    })
                }</table>
            </div>
        );
    }

}