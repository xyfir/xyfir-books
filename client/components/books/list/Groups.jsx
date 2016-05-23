import React from "react";

export default class ListGroups extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const groups = [
            { name: "All", property: "all", route: "all", arr: [] },
            { name: "Authors", property: "authors", route: "authors", arr: [] },
            { name: "Author Sort", property: "author_sort", route: "author-sort", arr: [] },
            { name: "Ratings", property: "rating", route: "ratings", arr: [] },
            { name: "Series", property: "series", route: "series", arr: [] },
            { name: "Tags", property: "tags", route: "tags", arr: [] }
        ];
        
        // Count unique instances within each list group
        groups.forEach((group, i) => {
            // Count books for all
            if (i == 0) {
                groups[0].arr = this.props.data.books.map(b => b.id);
                return;
            }
            
            this.props.data.books.forEach(book => {
                // Tags group
                if (group.property == "tags") {
                    this.props.data.books.forEach(book => {
                        book.tags.forEach(tag => {
                            if (groups[i].arr.indexOf(tag) == -1)
                                groups[i].arr.push(tag);
                        });
                    });
                }
                // Non-tags groups
                else {
                    let val;
                            
                    switch (group.property) {
                        case "rating":
                            val = book.rating === undefined
                                ? 0 : Math.floor(book.rating);
                            break;
                        
                        case "series":
                            if (!book.series)
                                return;
                            else
                                val = book.series;
                            break;
                                
                        default:
                            val = book[group.property];
                    }
                    
                    if (groups[i].arr.indexOf(val) == -1)
                        groups[i].arr.push(val);
                }
            });
        });
        
        groups[1].property = "author-sort";
        
        return (
            <div className="list-groups">
                <table className="list">{
                    groups.map(group => {
                        return (
                            <tr>
                                <td><a href={`#books/list/${group.route}`}>{group.name}</a></td>
                                <td>{group.arr.length}</td>
                            </tr>
                        )
                    })
                }</table>
            </div>
        );
    }

}