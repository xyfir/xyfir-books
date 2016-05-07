import React from "react";

// Action creators
import { setSearchQuery } from "../../../actions/creators/books";

export default class BasicSearch extends React.Component {

    constructor(props) {
        super(props);
        
        this.onSearch = this.onSearch.bind(this);
    }
    
    onSearch(e) {
        this.props.dispatch(setSearchQuery(e.target.value));
    }

    render() {
        return (
            <input type="text" placeholder="Search" onChange={this.onSearch} />
        );
    }

}