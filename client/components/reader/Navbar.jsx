import React from "react";

// Modules
import showNavbarText from "lib/misc/show-navbar-text";
import request from "lib/request/index";

// Constants
import { URL } from "constants/config";

export default class ReaderNavbar extends React.Component {

    constructor(props) {
        super(props);

        this.state = { show: true };
        
        this._isBookmarked = this._isBookmarked.bind(this);
        this._hide = this._hide.bind(this);
    }
    
    componentDidMount() {
        this._hide();
    }
    
    onMouseOver() {
        clearTimeout(this.timeout);
    }
    
    onMouseOut() {
        this._hide();
    }
    
    onBookmark() {
        const cfi = epub.getCurrentLocationCfi();
        
        // Update app/component state
        const update = (bookmarks) => this.props.updateBook({ bookmarks });
        
        // Remove bookmark
        if (this._isBookmarked()) {
            request({
                url: URL + "api/books/" + this.props.book.id + "/bookmark",
                method: "DELETE", data: { cfi }, success: (res) => {
                    if (!res.error) {
                        update(this.props.book.bookmarks.filter(bm => {
                            return cfi != bm.cfi;
                        }));
                    }
                }
            });
        }
        // Add bookmark
        else {
            request({
                url: URL + "api/books/" + this.props.book.id + "/bookmark",
                method: "POST", data: { cfi }, success: (res) => {
                    if (!res.error) {
                        update(this.props.book.bookmarks.concat([{
                            cfi, created: Date.now()
                        }]));
                    }
                }
            });
        }
    }
    
    _isBookmarked() {
        const cfi = epub.getCurrentLocationCfi();
        let value = false;
        
        this.props.book.bookmarks.forEach(bm => {
            if (cfi == bm.cfi) value = true;
        });
        
        return value;
    }
    
    _toggleShow() {
        this.setState({ show: !this.state.show });
    }

    _hide() {
        this.timeout = setTimeout(() => {
            this.setState({ show: false })
        }, 7000);
    }

    render() {
        const showText = showNavbarText();
        
        if (!this.state.show) return <div />;

        return (
            <nav
                className="navbar"
                onMouseOver={() => this.onMouseOver()}
                onMouseOut={() => this.onMouseOut()}
            >
                <a
                    className="icon-home"
                    title="Home / Recently Opened"
                    href="#books/recently-opened"
                >{showText ? "Home" : ""}</a>

                <a
                    className="icon-settings"
                    title="Settings"
                    href="#settings/reader"
                >{showText ? "Settings" : ""}</a>

                <a
                    onClick={() => this.props.onToggleShow("toc")}
                    className="icon-book"
                    title="Table of Contents"
                >{showText ? "TOC" : ""}</a>
                
                <a
                    onClick={() => this.onBookmark()}
                    className={
                        this._isBookmarked()
                        ? "icon-bookmark"
                        : "icon-bookmark-empty"
                    }
                    title="Bookmark"
                >{showText ? "Bookmark" : ""}</a>

                <a
                    onClick={() => this.props.onToggleShow("createNote")}
                    className="icon-edit"
                    title="Create Note"
                >{showText ? "Note" : ""}</a>

                <a
                    onClick={() => this.props.onToggleShow("more")}
                    className="icon-more"
                    title="More..."
                >{showText ? "More" : ""}</a>
            </nav>
        );
    }

}