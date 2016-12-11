import React from "react";

// Components
import ManageAnnotations from "./modal/ManageAnnotations";
import TableOfContents from "./modal/TableOfContents";
import BookStyling from "./modal/BookStyling";
import Annotation from "./modal/Annotation";
import CreateNote from "./modal/CreateNote";
import Bookmarks from "./modal/Bookmarks";
import BookInfo from "./modal/BookInfo";
import Notes from "./modal/Notes";
import More from "./modal/More";

export default class ReaderModal extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            fullscreen: window.innerHeight > window.innerWidth,
            canResize: window.innerHeight < window.innerWidth
        };
    }

    onResize() {
        this.setState({ fullscreen: !this.state.fullscreen });
    }

    render() {
        const p = this.props.parent, show = p.state.modal.show;
        
        const showModal = !!p.state.modal.show;
        
        if (showModal) {
            return (
                <div
                    className={"modal " + (
                        this.state.fullscreen ? "full " : ""
                    ) + (
                        ["bookInfo"].indexOf(show) > -1
                        ? "top" : ["bookStyling"].indexOf(show) > -1
                        ? "bottom" : "middle"
                    )}
                >
                    {this.state.canResize ? (
                        <span
                            title={
                                this.state.fullscreen ? "Shrink" : "Full Screen"
                            }
                            className={
                                "icon-resize-"
                                + (this.state.fullscreen ? "small" : "full")
                            }
                            onClick={() => this.onResize()}
                        />
                    ) : <span />}
                    <span
                        title="Close"
                        className="icon-close"
                        onClick={p.onCloseModal}
                    />
                
                    {show == "bookmarks" ? (
                        <Bookmarks
                            onClose={p.onCloseModal}
                            bookmarks={p.state.book.bookmarks}
                        />
                    ) : show == "notes" ? (
                        <Notes
                            book={p.state.book}
                            target={p.state.modal.target}
                            updateBook={p._updateBook}
                            onCycleHighlightMode={p.onCycleHighlightMode}
                        />
                    ) : show == "createNote" ? (
                        <CreateNote
                            book={p.state.book}
                            onClose={p.onCloseModal}
                            updateBook={p._updateBook}
                            onCycleHighlightMode={p.onCycleHighlightMode}
                        />
                    ) : show == "toc" ? (
                        <TableOfContents
                            onClose={p.onCloseModal}
                        />
                    ) : show == "manageAnnotations" ? (
                        <ManageAnnotations
                            book={p.state.book}
                            data={p.props.data}
                            updateBook={p._updateBook}
                            onCycleHighlightMode={p.onCycleHighlightMode}
                        />
                    ) : show == "more" ? (
                        <More
                            onToggleShow={p.onToggleShow}
                        />
                    ) : show == "annotation" ? (
                        <Annotation
                            book={p.state.book}
                            target={p.state.modal.target}
                        />
                    ) : show == "bookInfo" ? (
                        <BookInfo
                            book={p.state.book}
                        />
                    ) : show == "bookStyling" ? (
                        <BookStyling reader={p} />
                    ) : (
                        <div />
                    )}
                </div>
            )
        }
        else {
            return <div />;
        }
    }

}