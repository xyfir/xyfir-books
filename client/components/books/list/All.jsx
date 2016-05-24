import React from "react";

// Components
import Compact from "./all/Compact";
import Table from "./all/Table";
import Grid from "./all/Grid";
//
import Search from "../../misc/Search";

export default class ListAllBooks extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        let view;
        
        switch (this.props.data.config.bookList.view) {
            case "compact":
                view = <Compact data={this.props.data} dispatch={this.props.dispatch} />; break;
            case "table":
                view = <Table data={this.props.data} dispatch={this.props.dispatch} />; break;
            case "grid":
                view = <Grid data={this.props.data} dispatch={this.props.dispatch} />;
        }
        
        return (
            <div className="list-all">
                <Search dispatch={this.props.dispatch} />
                <p>
                    For advanced searches use <em>authors:search title:contains_query ...</em>.
                    <br />
                    Use underscores in place of spaces when a search query for a field contains spaces.
                </p>
                
                {view}
            </div>
        );
    }

}