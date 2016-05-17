import React from "react";

// Components
import BookList from "./BookList";
import General from "./General";
import Reader from "./Reader";

export default class Settings extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        switch (this.props.data.view.split('/')[1]) {
            case "BOOK_LIST":
                return <BookList data={this.props.data} dispatch={this.props.dispatch} />;
            case "GENERAL":
                return <General data={this.props.data} dispatch={this.props.dispatch} />;
            case "READER":
                return <Reader data={this.props.data} dispatch={this.props.dispatch} />;
        }
    }

}