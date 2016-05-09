import React from "react";

// Components
import Search from "../../misc/Search";

// Modules
import findListItems from "../../../lib/books/find-list-items";

export default class SubGroups extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        let subgroups = {/* 'subgroup': booksCount */};
        
        this.props.data.books.forEach(book => {
            if (this.props.group == "ratings") {
                const rating = Math.floor(+book.rating); 
                
                if (subgroups[rating] === undefined)
                    subgroups[rating] = 1;
                else
                    subgroups[rating]++;
            }
            else if (this.props.group == "tags") {
                book.tags.forEach(tag => {
                    if (tags[tag] === undefined)
                        tags[tag] = 1;
                    else
                        tags[tag]++;
                });
            }
            else {
                if (subgroups[book[this.props.group]] === undefined)
                    subgroups[book[this.props.group]] = 1;
                else
                    subgroups[book[this.props.group]]++;
            }
        });
        
        return (
            <div className={`list-${this.props.group.replace('_', '-')}`}>
                <Search dispatch={this.props.dispatch} />
                <table className="list">{
                    findListItems(subgroups, this.props.data.search).map(subgroup => {
                        return (
                            <tr>
                                <td><a href={
                                    `#books/list/all?${this.props.queryKey || this.props.group}`
                                    + `=${encodeURIComponent(subgroup)}`
                                }>{subgroup}{this.props.group == "ratings" ? " Stars" : ""}</a></td>
                                <td>{subgroups[subgroup]}</td>
                            </tr>
                        )
                    }).sort()
                }</table>
            </div>
        );
    }

}