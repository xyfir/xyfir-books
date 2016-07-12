import React from "react";

// Components
import Overlay from "./Overlay";
import Navbar from "./Navbar";
import Modal from "./modal/";

// Modules
import highlightNotes from "lib/reader/notes/highlight";
import request from "lib/request/";

// Constants
import { URL, PATH_SEPARATOR } from "constants/config";

// Action creators
import { updateBook } from "actions/creators/books";
import { save } from "actions/creators/";

export default class Reader extends React.Component {

    constructor(props) {
        super(props);

        const id = window.location.hash.split('/')[2];
        
        this.state = {
            book: this.props.data.books.find(b => id == b.id),
            pagesLeft: 0, percent: 0,
            //
            initialize: true, loading: true,
            //
            show: {
                manageAnnotations: false, more: false, bookmarks: false,
                notes: false, createNote: false, annotations: false,
                toc: false
            }
        };
        this.timers = {};
        
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
            this.props.dispatch(save("books"));
            
            this.setState({
                book: Object.assign({}, this.state.book, res)
            }, () => {
                const r = this.props.data.config.reader;
                
                // Create EPUB.JS reader object
                window.epub = ePub(url, {
                    storage: true, restore: true, spreads: false,
                    styles: {
                        fontSize: r.fontSize + "em", padding: "0em " + r.padding + "em",
                        backgroundColor: r.backgroundColor,
                        lineHeight: r.lineHeight + "em"
                    }
                });
                
                // Count and update book's word count
                if (this.state.book.word_count == 0) {
                    const files = epub.zip.zip.files;
                    const zip = new JSZip();
                    let count = 0;

                    Object.keys(files).forEach(file => {
                        if (file.split('.')[1] != "html") return;
                        
                        count += zip
                            .utf8decode(files[file]._data.getContent())
                            .replace(/(<([^>]+)>)/ig, " ")
                            .split(/\s+/).length;
                    });
                    
                    request({
                        url: `${URL}api/books/${this.state.book.id}/word-count`,
                        method: "PUT", data: { count }, success: (res) => {
                            this._updateBook({ word_count: count });
                        }
                    });
                }
            });
        }});
        
        this._addEventListeners = this._addEventListeners.bind(this);
        this.onCloseModal = this.onCloseModal.bind(this);
        this._applyStyles = this._applyStyles.bind(this);
        this._updateBook = this._updateBook.bind(this);
        this._initialize = this._initialize.bind(this);
    }
    
    componentDidMount() {
        if (epub) this._initialize();
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
                this.props.dispatch(save("books"));
            }
        });
        
        epub.destroy(); window.epub = undefined;
    }
    
    onToggleShow(prop, closeModal = false) {
        if (closeModal) this.onCloseModal();
        
        this.setState({
            show: Object.assign({}, this.state.show, {
                [prop]: !this.state.show[prop]
            })
        });
    }
    
    onCloseModal() {
        this.setState({ show: {
            toc: false, bookmarks: false, notes: false, createNote: false,
            more: false, manageAnnotations: false
        }});
    }
    
    _initialize() {
        if (!epub) return;
        
        this.setState({ initialize: false });
        
        epub.renderTo("book").then(() => {
            epub.generatePagination().then(pages => {
                // Set initial location
                if (this.state.book.bookmarks.length > 0) {
                    epub.gotoCfi(
                        this.state.book.bookmarks[0].cfi
                    );
                }
                else {
                    epub.gotoPercentage(
                        this.state.book.percent_complete / 100
                    );
                }
                
                this.setState({ loading: false });
                this._applyStyles();
                this._addEventListeners();
                highlightNotes(this.state.book.notes);
            });
        });
    } 
    
    _applyStyles() {
        const r = this.props.data.config.reader;
        
        // Font color requires more explicit CSS to override other styles
        // Must be applied every time a chapter changes
        let s = epub.renderer.doc.createElement("style");
        s.innerHTML = `*{color: ${r.color} !important;}`;
        epub.renderer.doc.head.appendChild(s);
    }
    
    _addEventListeners() {
        // Update pages left in chapter
        // Update percent complete
        epub.on("renderer:locationChanged", cfi => {
            const hasColumns = document.querySelector("#book > iframe")
                .contentDocument.querySelector("html")
                .style.width != "auto";
            
            this.setState({
                pagesLeft: (hasColumns
                    ? Math.round(epub.renderer.getRenderedPagesLeft() / 2)
                    : epub.renderer.getRenderedPagesLeft()
                ),
                percent: this._getPercentComplete()
            });
        });
        
        // Set font color, highlight notes
        epub.on("renderer:chapterDisplayed", () => {
            this._applyStyles();
            highlightNotes(this.state.book.notes);
        });
        
        // Regenerate pagination and update percent
        epub.on("renderer:resized", () => {
            clearTimeout(this.timers.resized);
            
            this.timers.resized = setTimeout(() => {
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
        this.props.dispatch(save("books"));
    }

    render() {
        if (!epub) return <div />;
        
        return (
            <div className="reader">
                <Navbar
                    book={this.state.book}
                    updateBook={this._updateBook}
                    onToggleShow={this.onToggleShow}
                />
                
                <section id="book" />
                
                <Overlay
                    loading={this.state.loading}
                    percent={this.state.percent}
                    pagesLeft={this.state.pagesLeft}
                    onToggleShow={this.onToggleShow}
                />
                
                <Modal
                    show={this.state.show}
                    book={this.state.book}
                    dispatch={this.props.dispatch}
                    updateBook={this.props._updateBook}
                    onCloseModal={this.onCloseModal}
                    onToggleShow={this.onToggleShow}
                />
            </div>
        );
    }

}