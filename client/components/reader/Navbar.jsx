import React from "react";

// Modules
import showNavbarText from "lib/misc/show-navbar-text";
import request from "lib/request/index";

// Constants
import { URL } from "constants/config";

export default class ReaderNavbar extends React.Component {

    constructor(props) {
        super(props);

        this.state = { showNavbar: true };
        
        this._isBookmarked = this._isBookmarked.bind(this);
        this.onShowNavbar = this.onShowNavbar.bind(this);
        this.onHideNavbar = this.onHideNavbar.bind(this);
        this._hideNavbar = this._hideNavbar.bind(this);
        this.onMouseOver = this.onMouseOver.bind(this);
        this.onMouseOut = this.onMouseOut.bind(this);
        this.onBookmark = this.onBookmark.bind(this);
    }
    
    componentDidMount() {
        this._hideNavbar();
    }
    
    onMouseOver() {
        clearTimeout(this.timeout);
    }
    
    onMouseOut() {
        this._hideNavbar();
    }
    
    onShowNavbar() {
        this.setState({ showNavbar: true });
        this._hideNavbar();
    }

    onHideNavbar() {
        this.setState({ showNavbar: false });
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

    _hideNavbar() {
        this.timeout = setTimeout(() => {
            this.setState({ showNavbar: false })
        }, 7000);
    }

    render() {
        const showText = showNavbarText();
        
        if (this.state.showNavbar) {
            return (
                <nav
                    className="nav-bar"
                    onMouseOver={this.onMouseOver}
                    onMouseOut={this.onMouseOut}
                >
                    <div className="left">
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
                    </div>
                    
                    <span
                        onClick={this.onHideNavbar}
                        className="title"
                    >{this.props.book.title}</span>
                    
                    <div className="right">
                        <a
                            onClick={this.onBookmark}
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
                    </div>
                </nav>
            );
        }
        else {
            // Invisible div for showing navbar on click
            return (
                <div
                    className="nav-bar-hidden"
                    onClick={this.onShowNavbar}
                />
            );
        }
    }

}