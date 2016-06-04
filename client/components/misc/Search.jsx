import React from "react";

// Action creators
import { setSearch } from "../../actions/creators/";

export default class BasicSearch extends React.Component {

    constructor(props) {
        super(props);
        
        this.onSearch = this.onSearch.bind(this);
        this.setValue = this.setValue.bind(this);
    }
    
    componentWillUnmount() {
        this.props.dispatch(setSearch(""));
    }
    
    onSearch() {
        this.props.dispatch(setSearch(
            this.refs.search.value.toLowerCase()
        ));
    }
    
    setValue(val) {
        this.refs.search.value = val;
        this.onSearch();
    }

    render() {
        return (
            <input
                ref="search"
                type="text"
                onChange={this.onSearch}
                placeholder={this.props.placeholder || "Search"}
            />
        );
    }

}