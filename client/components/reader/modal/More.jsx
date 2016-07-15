import React from "react";
 
export default class More extends React.Component {

    constructor(props) {
        super(props);
    }

    onClick(t) {
        this.props.onToggleShow(t, true);
    }

    render() {
        return (
            <ul className="more">
                <li><a onClick={() => this.onClick("bookmarks")}>
                    Bookmarks
                </a></li>
                <li><a onClick={() => this.onClick("notes")}>
                    Notes
                </a></li>
                <li><a onClick={() => this.onClick("manageAnnotations")}>
                    Annotations
                </a></li>
            </ul>
        );
    }

}