import React from "react";

// Components
import Download from "./Download";
import Upload from "./Upload";
import Info from "./Info";

export default class ManageLibrary extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        switch (this.props.data.view.split('/')[1]) {
            case "DOWNLOAD":
                return <Download data={this.props.data} dispatch={this.props.dispatch} />;
            case "UPLOAD":
                return <Upload data={this.props.data} dispatch={this.props.dispatch} />;
            case "INFO":
                return <Info data={this.props.data} dispatch={this.props.dispatch} />;
        }
    }

}