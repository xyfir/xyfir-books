import React from "react";

// Action creators
import { setSearch } from "actions/creators/index";

export default class Search extends React.Component {

    constructor(props) {
        super(props);
        
        this.onSearch = this.onSearch.bind(this);
        this.setValue = this.setValue.bind(this);
    }
    
    componentWillUnmount() {
        this.props.dispatch(setSearch(""));
    }
    
    onSearch() {
        clearTimeout(this.timeout);
        
        this.timeout = setTimeout(() => {
            this.props.dispatch(setSearch(
                this.refs.search.value.toLowerCase()
            ))
        }, 150);
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