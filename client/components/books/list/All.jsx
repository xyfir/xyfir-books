import React from "react";

// Components
import Compact from "./all/Compact";
import Table from "./all/Table";
import Grid from "./all/Grid";
//
import Search from "components/misc/Search";

// Modules
import parseHashQuery from "lib/url/parse-hash-query";

export default class ListAllBooks extends React.Component {

    constructor(props) {
        super(props);

        this._updateSearch = this._updateSearch.bind(this);
    }
    
    componentDidMount() {
        this._updateSearch();
    }

    componentDidUpdate() {
        this._updateSearch();
    }

    onSearchInfo() {
        swal({
            title: "Advanced Search Information",
            text: `
                For advanced searches you can search by metadata field
                <br/><br />
                <strong>Example:</strong> <code>authors:search title:contains_query</code>
                <br /><br />
                Use underscores in place of spaces when a search query for a field contains spaces.
                <br />
                Using multiple fields will return all books that match any of fields.
            `,
            html: true
        });
    }

    _updateSearch() {
        const qo = parseHashQuery();
        
        if (qo.search) {
            delete qo.search;
            const qa = Object.keys(qo);

            const value = qa[0] + ":" + qo[qa[0]]
                .replace(new RegExp(' ', 'g'), '_');
            
            // Only set if value is different
            if (this.refs.search.refs.search.value != value)
                this.refs.search.setValue(value);
        }
    }

    render() {
        let view;
        
        switch (this.props.data.config.bookList.view) {
            case "compact":
                view = <Compact {...this.props} />; break;
            case "table":
                view = <Table {...this.props} />; break;
            case "grid":
                view = <Grid {...this.props} />;
        }
        
        return (
            <div className="list-all">
                <div className="book-search">
                    <Search ref="search" dispatch={this.props.dispatch} />
                    <a
                        onClick={() => this.onSearchInfo()}
                        className="icon-info"
                    />
                </div>
                
                {view}
            </div>
        );
    }

}