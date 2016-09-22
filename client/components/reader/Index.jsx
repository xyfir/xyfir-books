import React from "react";

// Components
import Overlay from "./Overlay";
import Navbar from "./Navbar";
import Modal from "./modal/Index";

// Modules
import findAnnotationMarkers from "lib/reader/annotations/find-markers";
import insertAnnotations from "lib/reader/annotations/insert";
import updateAnnotations from "lib/reader/annotations/update";
import highlightNotes from "lib/reader/notes/highlight";
import request from "lib/request/index";

// Constants
import { URL, LIBRARY_URL } from "constants/config";

// Action creators
import { updateBook } from "actions/creators/books";
import { save } from "actions/creators/index";

export default class Reader extends React.Component {

    constructor(props) {
        super(props);

        const id = window.location.hash.split('/')[2];
        
        this.state = {
            book: this.props.data.books.find(b => id == b.id),
            pagesLeft: 0, percent: 0,
            //
            initialize: false, loading: true,
            //
            show: {
                manageAnnotations: false, more: false, bookmarks: false,
                notes: false, createNote: false, annotations: false,
                toc: false, annotation: false
            }, modalViewTarget: ""
        };
        this.timers = {};
        
        let url = LIBRARY_URL + "files/" + this.props.data.account.library + "/";
        
        this.state.book.formats.forEach(format => {
            if (format.split('.')[1] == "epub") {
                url += format.split('/').slice(-3).join('/');
            }
        });
        
        // Get bookmarks, notes, last read time
        request({url: URL + "api/books/" + id, success: (res) => {
            const r = this.props.data.config.reader;

            // Update / set book's annotations
            updateAnnotations(this.state.book.annotations, r.annotationsKey, ans => {
                res.annotations = ans;

                this.setState({
                    book: Object.assign({}, this.state.book, res)
                }, () => {
                    // Update book in app/component/storage
                    this.props.dispatch(updateBook(id, res));
                    this.props.dispatch(save("books"));

                    // Create EPUB.JS reader object
                    window.epub = ePub(url, {
                        storage: true, restore: true, spreads: false,
                        styles: {
                            fontSize: r.fontSize + "em", padding: "0em " + r.padding + "em",
                            backgroundColor: r.backgroundColor,
                            lineHeight: r.lineHeight + "em"
                        }
                    });

                    this.setState({ initialize: true });
                    this._getWordCount();
                });
            });
            
        }});
        
        this.onToggleAnnotations = this.onToggleAnnotations.bind(this);
        this._addEventListeners = this._addEventListeners.bind(this);
        this._getWordCount = this._getWordCount.bind(this);
        this.onToggleShow = this.onToggleShow.bind(this);
        this.onCloseModal = this.onCloseModal.bind(this);
        this._applyStyles = this._applyStyles.bind(this);
        this._updateBook = this._updateBook.bind(this);
        this._initialize = this._initialize.bind(this);
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

    onToggleAnnotations() {
        this.onToggleShow("annotations", false, () => this._applyStyles());
    }
    
    onToggleShow(prop, closeModal, fn) {
        if (closeModal) this.onCloseModal();
        
        this.setState({
            show: Object.assign({}, this.state.show, {
                [prop]: !this.state.show[prop]
            })
        }, fn);
    }
    
    onCloseModal() {
        this.setState({ show: {
            toc: false, bookmarks: false, notes: false, createNote: false,
            more: false, manageAnnotations: false, annotation: false,
            annotations: this.state.show.annotations
        }, modalViewTarget: "" });
    }
    
    _initialize() {
        this.setState({ initialize: false });

        // View annotation or note
        epub.onClick = (type, key) => {
            this.setState({ modalViewTarget: key }, () => {
                this.onToggleShow(
                    type == "note" ? "notes" : type,
                    false, () => this._applyStyles()
                );
            });
        };
        
        // Render ebook to pages
        epub.renderTo("book").then(() => {
            // Generate pagination so we can get pages/percent
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

                // Generate annotation markers
                epub.annotationMarkers = findAnnotationMarkers(
                    this.state.book.annotations
                );
                
                this.setState({ loading: false });
                this._applyStyles();
                this._addEventListeners();

                insertAnnotations(
                    this.state.book.annotations,
                    epub.annotationMarkers
                );
                highlightNotes(this.state.book.notes);
            });
        });
    } 
    
    _applyStyles() {
        const r = this.props.data.config.reader;
        
        let s = epub.renderer.doc.getElementById("reader-styles");
        let create = false;

        if (s === null) {
            s = epub.renderer.doc.createElement("style");
            create = true;
        }
        
        s.innerHTML = `
            * { color: ${r.color} !important; }
            ${
                this.state.show.annotations
                ? `.annotation { background-color: ${r.annotationColor}; }`
                : `.note { background-color: ${r.highlightColor}; }`
            }
        `;

        if (create) {
            s.setAttribute("id", "reader-styles");
            epub.renderer.doc.head.appendChild(s);
        }
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
        
        // Apply styles
        // Insert annotations / highlight notes
        epub.on("renderer:chapterDisplayed", () => {
            this._applyStyles();

            insertAnnotations(
                this.state.book.annotations,
                epub.annotationMarkers
            );
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

    _getWordCount() {
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
    }

    render() {
        if (window.epub === undefined) return <div />;
        
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
                    onToggleAnnotations={this.onToggleAnnotations}
                />
                
                <Modal parent={this} />
            </div>
        );
    }

}