import React from "react";

export default class Bookmarks extends React.Component {

    constructor(props) {
        super(props);
    }
    
    onGoToBookmark(cfi) {
        epub.gotoCfi(cfi);
        this.props.onClose();
    }

    render() {
        return (
            <ul className="bookmarks">{
                this.props.bookmarks.map((bm, i) => {
                    return (
                        <li>
                            <a onClick={this.onGoToBookmark.bind(this, bm.cfi)}>
                                Bookmark #{i + 1}
                            </a>
                            <span className="created">
                                Created {(new Date(bm.created).toLocaleString())}
                            </span>
                        </li>
                    );
                })
            }</ul>
        );
    }

}