import React from "react";

// Action creators
import { setSearch } from "../../../actions/creators/";

export default class BasicSearch extends React.Component {

    constructor(props) {
        super(props);
        
        this.onSearch = this.onSearch.bind(this);
    }
    
    onSearch(e) {
        this.props.dispatch(setSearch(e.target.value.toLowerCase()));
    }

    render() {
        return (
            <input type="text" placeholder="Search" onChange={this.onSearch} />
        );
    }

}