import React from "react";

// Components
import Search from "../../../misc/Search";

// Modules
import findListItems from "../../../../lib/books/find-list-items";

export default class ListTags extends React.Component {

    constructor(props) {    
        super(props);
    }

    render() {
        let tags = {/* 'tag': booksCount */};
        
        this.props.data.books.forEach(book => {
            book.tags.forEach(tag => {
                if (tags[tag] === undefined)
                    tags[tag] = 1;
                else
                    tags[tag]++;
            });
        });
        
        return (
            <div className="list-tags">
                <Search dispatch={this.props.dispatch} />
                <table className="list">{
                    findListItems(tags, this.props.data.search).map(tag => {
                        return (
                            <tr>
                                <td><a href={`#books/list/all?tag=${encodeURIComponent(tag)}`}>
                                    {tag}
                                </a></td>
                                <td>{tags[tag]}</td>
                            </tr>
                        )
                    })
                }</table>
            </div>
        );
    }

}