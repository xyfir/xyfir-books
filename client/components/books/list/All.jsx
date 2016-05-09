import React from "react";

// Components
import Compact from "./all/Compact";
import Table from "./all/Table";
import Grid from "./all/Grid";

export default class ListAllBooks extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        switch (this.props.data.config.bookList.view) {
            case "compact":
                return <Compact data={this.props.data} dispatch={this.props.dispatch} />;
            case "table":
                return <Table data={this.props.data} dispatch={this.props.dispatch} />;
            case "grid":
                return <Grid data={this.props.data} dispatch={this.props.dispatch} />;
        }
    }

}