import React from "react";

// Components
import Search from "../../../misc/Search";

// Modules
import findListItems from "../../../../lib/books/findMatches";

export default class ListSeries extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        let seriesGroups = {/* 'series': booksCount */};
        
        this.props.data.books.forEach(book => { 
            if (seriesGroups[book.series] === undefined)
                seriesGroups[book.series] = 1;
            else
                seriesGroups[book.series]++;
        });
        
        return (
            <div className="list-series">
                <Search dispatch={this.props.dispatch} />
                <table className="list">{
                    findListItems(seriesGroups, this.props.data.search).map(series => {
                        return (
                            <tr>
                                <td><a href={`#books/list/all?series=${encodeURIComponent(series)}`}>
                                    {series}
                                </a></td>
                                <td>{seriesGroups[series]}</td>
                            </tr>
                        )
                    })
                }</table>
            </div>
        );
    }

}