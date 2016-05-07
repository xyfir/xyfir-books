import React from "react";

// Components
import MetaData from "./Metadata";
import Upload from "./Upload";
import List from "./list/";
import Read from "./read/";

export default class Books extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        switch (this.props.data.view.split('/')[1]) {
            case "METADATA":
                return <MetaData data={this.props.data} dispatch={this.props.dispatch} />;
            case "UPLOAD":
                return <Upload data={this.props.data} dispatch={this.props.dispatch} />;
            case "LIST":
                return <List data={this.props.data} dispatch={this.props.dispatch} />;
            case "READ":
                return <Read data={this.props.data} dispatch={this.props.dispatch} />;
        }
    }

}