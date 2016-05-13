import React from "react";

// Components
import RecentlyOpened from "./RecentlyOpened";
import AddFormat from "./AddFormat";
import Manage from "./Manage";
import Upload from "./Upload";
import List from "./list/";
import Read from "./read/";

export default class Books extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        switch (this.props.data.view.split('/')[1]) {
            case "RECENTLY_OPENED":
                return <RecentlyOpened data={this.props.data} dispatch={this.props.dispatch} />;
            case "ADD_FORMAT":
                return <AddFormat data={this.props.data} dispatch={this.props.dispatch} />;
            case "MANAGE":
                return <Manage data={this.props.data} dispatch={this.props.dispatch} />;
            case "UPLOAD":
                return <Upload data={this.props.data} dispatch={this.props.dispatch} />;
            case "LIST":
                return <List data={this.props.data} dispatch={this.props.dispatch} />;
            case "READ":
                return <Read data={this.props.data} dispatch={this.props.dispatch} />;
        }
    }

}