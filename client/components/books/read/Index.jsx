import React from "react";

// Components
import TableOfContents from "./TableOfContents";
import Bookmarks from "./Bookmarks";
import Search from "./Search";
import Notes from "./Notes";

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
            showNavbar: false, pagesLeft: 0, percent: 0,
            showBookmarks: false, showNotes: false,
            showSearch: false, showMore: false,
            initialize: true, showToc: false
        };
        
        let url = this.props.data.account.library.address + "library/"
            + this.props.data.account.library.id + "/files/";
        
        this.state.book.formats.forEach(format => {
            if (format.split('.')[1] == "epub") {
                url += format.split(PATH_SEPARATOR).slice(-3).join('/');
            }
        });
        
        if (navigator.onLine) {
            // Get bookmarks, notes, last read time
            request({url: URL + "api/books/" + id, success: (res) => {
                // Update book in application and component state
                this.props.dispatch(updateBook(id, res));
                this.setState(
                    { book: Object.assign({}, this.state.book, res) },
                    () => {
                        this.epub = ePub(url, {
                            storage: true, restore: true, spreads: false
                        }); window.epub = this.epub;
                        
                        this.setState({ showNavbar: true });
                        
                        // Count and update book's word count
                        if (this.state.book.word_count == 0) {
                            EPUBJS.core.request(url, "binary").then(data => {
                                const zip = new JSZip(data);
                                let count = 0;
                                
                                Object.keys(zip.files).forEach(file => {
                                    if (file.split('.')[1] != "html") return;
                                    
                                    count += zip.utf8decode(zip.files[file]._data.getContent())
                                        .replace(/(<([^>]+)>)/ig, " ")
                                        .split(/\s+/).length;
                                });
                                
                                request({
                                    url: URL + "api/books/" + this.state.book.id + "/word-count",
                                    method: "PUT", data: { count }, success: (res) => {
                                        this._updateBook({ word_count: count });
                                    }
                                });
                            });
                        }
                    }
                );
            }});
        }
        
        this._addEventListeners = this._addEventListeners.bind(this);
        this.onMouseOverNavbar = this.onMouseOverNavbar.bind(this);
        this.onMouseOutNavbar = this.onMouseOutNavbar.bind(this);
        this._isBookmarked = this._isBookmarked.bind(this);
        this.onShowNavbar = this.onShowNavbar.bind(this);
        this.onCloseModal = this.onCloseModal.bind(this);
        this._updateBook = this._updateBook.bind(this);
        this._initialize = this._initialize.bind(this);
        this.onBookmark = this.onBookmark.bind(this);
    }
    
    componentDidMount() {
        if (this.epub) this._initialize();
        
        this.onMouseOutNavbar();
    }
    
    componentDidUpdate() {
        if (this.state.initialize) this._initialize();
    }
    
    componentWillUnmount() {
        // Update book's percent complete and last read time
        request({
            url: URL + "api/books/" + this.state.book.id + "/close",
            data: { percentComplete: this.state.percent },
            method: "POST", success: (res) => {
                res.percent_complete = this.state.percent;
                
                this.props.dispatch(updateBook(
                    this.state.book.id, res
                ));
            }
        });
        
        this.epub.destroy(); window.epub = undefined;
    }
    
    onMouseOverNavbar() {
        clearTimeout(this.navbarTimeout);
    }
    
    onMouseOutNavbar() {
        this.navbarTimeout = setTimeout(() => this.onToggleShow("Navbar"), 7000);
    }
    
    onToggleShow(prop, closeModal = false) {
        if (closeModal) this.onCloseModal();
        
        this.setState({
            ["show" + prop]: !this.state["show" + prop]
        });
    }
    
    onShowNavbar() {
        this.setState({ showNavbar: true });
        this.onMouseOutNavbar();
    }
    
    onCloseModal() {
        this.setState({
            showToc: false, showBookmarks: false, showNotes: false,
            showSearch: false, showMore: false
        });
    }
    
    onBookmark() {
        const cfi = this.epub.getCurrentLocationCfi();
        
        // Update app/component state
        const update = (bookmarks) => this._updateBook({ bookmarks });
        
        // Remove bookmark
        if (this._isBookmarked()) {
            request({
                url: URL + "api/books/" + this.state.book.id + "/bookmark",
                method: "DELETE", data: { cfi }, success: (res) => {
                    if (!res.error) {
                        update(this.state.book.bookmarks.filter(bm => {
                            return cfi != bm.cfi;
                        }));
                    }
                }
            });
        }
        // Add bookmark
        else {
            request({
                url: URL + "api/books/" + this.state.book.id + "/bookmark",
                method: "POST", data: { cfi }, success: (res) => {
                    if (!res.error) {
                        update(this.state.book.bookmarks.concat([{
                            cfi, created: Date.now()
                        }]));
                    }
                }
            });
        }
    }
    
    _isBookmarked() {
        const cfi = this.epub.getCurrentLocationCfi();
        let value = false;
        
        this.state.book.bookmarks.forEach(bm => {
            if (cfi == bm.cfi) value = true;
        });
        
        return value;
    }
    
    _initialize() {
        if (!this.epub) return;
        
        this.setState({ initialize: false });
        
        this.epub.renderTo("book").then(() => {
            this.epub.generatePagination().then(pages => {
                // Set initial location
                if (this.state.book.bookmarks.length > 0) {
                    this.epub.gotoCfi(
                        this.state.book.bookmarks[0].cfi
                    );
                }
                else {
                    this.epub.gotoPercentage(
                        this.state.book.percent_complete / 100
                    );
                }
                
                this._addEventListeners();
            });
        });
    }
    
    _addEventListeners() {
        // Update pages left in chapter / percent complete
        this.epub.on("renderer:locationChanged", cfi => {
            const hasColumns = document.querySelector("#book > iframe")
                .contentDocument.querySelector("html")
                .style.width != "auto";
            
            this.setState({
                pagesLeft: (hasColumns
                    ? Math.round(this.epub.renderer.getRenderedPagesLeft() / 2)
                    : this.epub.renderer.getRenderedPagesLeft()
                ),
                percent: this._getPercentComplete()
            })
        });
        
        // Regenerate pagination and update percent
        this.epub.on("renderer:resized", () => {
            clearTimeout(this.resizedTimeout);
            
            this.resizedTimeout = setTimeout(() => {
                epub.generatePagination().then(pages => {
                    this.setState({
                        percent: this._getPercentComplete()
                    });
                });
            }, 500);
        });
    }
    
    _getPercentComplete() {
        return Math.round(
            epub.pagination.percentageFromCfi(
                epub.getCurrentLocationCfi()
            ) * 100
        );
    }
    
    _updateBook(obj) {
        this.props.dispatch(updateBook(
            this.state.book.id, obj
        ));
        this.setState({
            book: Object.assign({}, this.state.book, obj)
        });
    }

    render() {
        if (!this.epub) return <div />;
        
        const showText = window.screen.height < window.screen.width;
        const showModal = this.state.showBookmarks || this.state.showMore
            || this.state.showNotes || this.state.showSearch || this.state.showToc;
        
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
                        
                        <span
                            className="title"
                            onClick={this.onToggleShow.bind(this, "Navbar")}
                        >{
                            this.state.book.title
                        }</span>
                        
                        <div className="right">
                            <a onClick={this.onBookmark}>
                                <span
                                    className={
                                        this._isBookmarked()
                                        ? "icon-bookmark"
                                        : "icon-bookmark-empty"
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
                
                <div className="overlay">
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
                    
                    <span className="status">{
                        this.state.percent + "% | " + (!this.state.pagesLeft
                            ? "Last page in chapter"
                            : this.state.pagesLeft + " pages left in chapter") 
                    }</span>
                </div>
                
                {showModal ? (
                    <section className="modal">
                        <span
                            title="Close"
                            className="icon-close"
                            onClick={this.onCloseModal}
                        />
                    
                        {this.state.showBookmarks ? (
                            <Bookmarks
                                data={this.state}
                                onClose={this.onCloseModal}
                                bookmarks={this.state.book.bookmarks}
                            />
                        ) : (this.state.showNotes ? (
                            <Notes
                                data={this.state}
                                book={this.state.book}
                                onClose={this.onCloseModal}
                                updateBook={this._updateBook}
                            />
                        ) : (this.state.showSearch ? (
                            <Search data={this.state} onClose={this.onCloseModal} />
                        ) : (this.state.showToc ? (
                            <TableOfContents data={this.state} onClose={this.onCloseModal} />
                        ) : (this.state.showMore ? (
                            <ul className="more">
                                <li><a onClick={this.onToggleShow.bind(this, "Bookmarks", true)}>
                                    Bookmarks
                                </a></li>
                                <li><a onClick={this.onToggleShow.bind(this, "Notes", true)}>
                                    Notes
                                </a></li>
                            </ul>
                        ) : (<div />)))))}
                    </section>
                ) : (
                    <div />
                )}
            </div>
        );
    }

}