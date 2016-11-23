import React from "react";

// Action creators
import { setSearch } from "actions/creators/index";

// Modules
import parseQuery from "lib/url/parse-hash-query";

export default class Search extends React.Component {

    constructor(props) {
        super(props);
        
        this.setValue = this.setValue.bind(this);
    }
    
    componentWillUnmount() {
        this.props.dispatch(setSearch(""));
    }
    
    onSearch(sv) {
        clearTimeout(this.timeout);

        // Clear query string
        if (!sv && parseQuery().search) {
            location.hash = location.hash.split('?')[0];
        }
        
        this.timeout = setTimeout(() => {
            this.props.dispatch(setSearch(
                this.refs.search.value.toLowerCase()
            ))
        }, 150);
    }
    
    setValue(val) {
        this.refs.search.value = val;
        this.onSearch(true);
    }

    render() {
        return (
            <input
                ref="search"
                type="text"
                onChange={() => this.onSearch()}
                placeholder={this.props.placeholder || "Search"}
            />
        );
    }

}