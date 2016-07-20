import React from "react";

// Components
import ManageAnnotations from "./ManageAnnotations";
import TableOfContents from "./TableOfContents";
import Annotation from "./Annotation";
import CreateNote from "./CreateNote";
import Bookmarks from "./Bookmarks";
import Notes from "./Notes";
import More from "./More";

export default class ReaderModal extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            fullscreen: window.screen.height > window.screen.width,
            canResize: window.screen.height < window.screen.width
        };
    }

    onResize() {
        this.setState({ fullscreen: !this.state.fullscreen });
    }

    render() {
        const p = this.props.parent, show = p.state.show;
        
        const showModal = show.bookmarks || show.more || show.annotation
            || show.manageAnnotations || show.notes
            || show.createNote || show.toc;
        
        if (showModal) {
            return (
                <section
                    className={"modal" + (this.state.fullscreen ? " full" : "")}
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
                
                    {show.bookmarks ? (
                        <Bookmarks
                            onClose={p.onCloseModal}
                            bookmarks={p.state.book.bookmarks}
                        />
                    ) : (show.notes ? (
                        <Notes
                            book={p.state.book}
                            target={p.state.modalViewTarget}
                            onClose={p.onCloseModal}
                            updateBook={p._updateBook}
                        />
                    ) : (show.createNote ? (
                        <CreateNote
                            book={p.state.book}
                            onClose={p.onCloseModal}
                            updateBook={p._updateBook}
                        />
                    ) : (show.toc ? (
                        <TableOfContents
                            onClose={p.onCloseModal}
                        />
                    ) : (show.manageAnnotations ? (
                        <ManageAnnotations
                            book={p.state.book}
                            data={p.props.data}
                            dispatch={p.props.dispatch}
                            updateBook={p._updateBook}
                        />
                    ) : (show.more ? (
                        <More
                            onToggleShow={p.onToggleShow}
                        />
                    ) : (show.annotation ? (
                        <Annotation
                            book={p.state.book}
                            target={p.state.modalViewTarget}
                        />
                    ) : (
                        <div />
                    )))))))}
                </section>
            )
        }
        else {
            return <div />;
        }
    }

}