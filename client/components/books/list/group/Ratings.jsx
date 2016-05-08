import React from "react";

// Components
import Search from "../../../misc/Search";

// Modules
import findListItems from "../../../../lib/books/findMatches";

export default class ListRatings extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        let ratings = {/* 'rating': booksCount */};
        
        this.props.data.books.forEach(book => {
            const rating = Math.floor(+book.rating); 
            
            if (ratings[rating] === undefined)
                ratings[rating] = 1;
            else
                ratings[rating]++;
        });
        
        return (
            <div className="list-ratings">
                <Search dispatch={this.props.dispatch} />
                <table className="list">{
                    findListItems(ratings, this.props.data.search).map(rating => {
                        return (
                            <tr>
                                <td><a href={`#books/list/all?rating=${encodeURIComponent(rating)}`}>
                                    {rating} Stars
                                </a></td>
                                <td>{ratings[rating]}</td>
                            </tr>
                        )
                    })
                }</table>
            </div>
        );
    }

}