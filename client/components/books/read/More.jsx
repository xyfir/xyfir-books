import React from "react";
 
export default class More extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <ul className="more">
                <li><a onClick={this.props.onToggleShow("Bookmarks", true)}>
                    Bookmarks
                </a></li>
                <li><a onClick={this.props.onToggleShow("Notes", true)}>
                    Notes
                </a></li>
                <li><a onClick={this.props.onToggleShow("ManageAnnotations", true)}>
                    Annotations
                </a></li>
            </ul>
        );
    }

}