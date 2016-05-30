import React from "react";

// Modules
import request from "../../../lib/request/";

// Constants
import { URL, PATH_SEPARATOR } from "../../../constants/config";

// Action creators
import { updateBook } from "../../../actions/creators/books";

export default class Reader extends React.Component {

    constructor(props) {
        super(props);

        const id = window.location.hash.split('/')[2];
        
        this.state = {
            book: this.props.data.books.find(b => id == b.id),
            setInitialLocation: true, showToc: false,
            showBookmarks: false, showNotes: false,
            showSearch: false, showMore: false,
            showNavbar: false
        };
        
        let url = this.props.data.account.library.address + "library/"
            + this.props.data.account.library.id + "/files/";
        
        this.state.book.formats.forEach(format => {
            if (format.split('.')[1] == "epub") {
                url += format.split(PATH_SEPARATOR).slice(-3).join('/');
            }
        });
        
        // Get bookmarks, notes, last read time
        request({url: URL + "api/books/" + id, success: (res) => {
            // Update book in application and component state
            this.props.dispatch(updateBook(id, res));
            this.setState(
                { book: Object.assign({}, this.state.book, res) },
                () => {
                    this.epub = ePub(url, {
                        storage: true, restore: true, spreads: false
                    });
                    window.epub = this.epub; // ** remove
                    
                    this.setState({ showNavbar: true });
                    
                    // Count and update book's word count
                    if (this.state.book.word_count == 0) {
                        
                    }
                }
            );
        }});
        
        this._setInitialLocation = this._setInitialLocation.bind(this);
        this.onMouseOverNavbar = this.onMouseOverNavbar.bind(this);
        this.onMouseOutNavbar = this.onMouseOutNavbar.bind(this);
        this._isBookmarked = this._isBookmarked.bind(this);
        this.onShowNavbar = this.onShowNavbar.bind(this);
    }
    
    componentDidMount() {
        if (this.epub) this._setInitialLocation();
        
        this.onMouseOutNavbar();
    }
    
    componentDidUpdate() {
        if (this.state.setInitialLocation) this._setInitialLocation();
    }
    
    componentWillUnmount() {
        const percentage = this.epub.locations.percentageFromCfi(
            this.epub.getCurrentLocationCfi()
        );
        
        // Update book's percent complete and last read time
        request({
            url: URL + "api/books/" + this.state.book.id + "/close",
            data: { percentComplete: percentage },
            method: "POST", success: (res) => {
                this.props.dispatch(updateBook(
                    this.state.book.id, res
                ));
            }
        });
        
        this.epub.destroy();
    }
    
    onMouseOverNavbar() {
        clearTimeout(this.navbarTimeout);
    }
    
    onMouseOutNavbar() {
        this.navbarTimeout = setTimeout(() => this.onToggleShow("Navbar"), 7000);
    }
    
    onToggleShow(prop) {
        this.setState({
            ["show" + prop]: !this.state["show" + prop]
        });
    }
    
    onShowNavbar() {
        this.setState({ showNavbar: true });
        this.onMouseOutNavbar();
    }
    
    _isBookmarked() {
        const cfi = this.epub.getCurrentLocationCfi();
        let value = false;
        
        this.state.book.bookmarks.forEach(bm => {
            if (cfi == bm.cfi) value = true;
        });
        
        return value;
    }
    
    _setInitialLocation() {
        if (!this.epub) return;
        
        this.setState({ setInitialLocation: false });
        
        this.epub.renderTo("book").then(() => {
            if (this.state.book.bookmarks.length > 0) {
                this.epub.gotoCfi(
                    this.state.book.bookmarks.sort((a, b) => {
                        if (a.created < b.created) return -1;
                        if (a.created > b.created) return 1;
                        return 0;
                    }).reverse()[0].cfi
                );
            }
            else {
                this.epub.gotoPercentage(this.state.book.percent_complete);
            }
        });
    }

    render() {
        if (!this.epub) return <div />;
        
        const showText = window.screen.height < window.screen.width;
        
        return (
            <div className="reader">
                {this.state.showNavbar ? (
                    <nav
                        className="nav-bar"
                        onMouseOver={this.onMouseOverNavbar}
                        onMouseOut={this.onMouseOutNavbar}
                    >
                        <div className="left">
                            <a href="#books/recently-opened">
                                <span
                                    className="icon-home"
                                    title="Home / Recently Opened"
                                />{showText ? " Home" : ""}
                            </a>
                            <a href="#settings/reader">
                                <span
                                    className="icon-settings"
                                    title="Settings"
                                />{showText ? " Settings" : ""}
                            </a>
                            <a onClick={this.onToggleShow.bind(this, "Toc")}>
                                <span
                                    className="icon-book"
                                    title="Table of Contents"
                                />{showText ? " ToC" : ""}
                            </a>
                        </div>
                        
                        <span className="title">{this.state.book.title}</span>
                        
                        <div className="right">
                            <a onClick={this.onBookmark}>
                                <span
                                    className={
                                        "icon-bookmark"
                                        + this._isBookmarked() ? "" : "-empty"
                                    }
                                    title="Bookmark"
                                />{showText ? " Bookmark" : ""}
                            </a>
                            <a onClick={this.onToggleShow.bind(this, "Search")}>
                                <span
                                    className="icon-search"
                                    title="Search"
                                />{showText ? " Search" : ""}
                            </a>
                            <a onClick={this.onToggleShow.bind(this, "More")}>
                                <span
                                    className="icon-more"
                                    title="More..."
                                />{showText ? " More" : ""}
                            </a>
                        </div>
                    </nav>
                ) : (
                    // Invisible div for showing navbar on click
                    <div
                        className="nav-bar-hidden"
                        onClick={this.onShowNavbar}
                    />
                )}
                
                <section id="book" />
                
                <div className="controls">
                    <div
                        className="previous-page"
                        onClick={() => this.epub.prevPage()}
                    />
                    <div
                        className="next-page"
                        onClick={() => this.epub.nextPage()}
                    />
                </div>
            </div>
        );
    }

}