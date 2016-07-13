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
    }

    render() {
        const showModal = this.props.show.bookmarks || this.props.show.more
            || this.props.show.manageAnnotations || this.props.show.notes
            || this.props.show.createNote || this.props.show.toc;
        
        if (showModal) {
            return (
                <section className="modal">
                    <span
                        title="Close"
                        className="icon-close"
                        onClick={this.props.onCloseModal}
                    />
                
                    {this.props.show.bookmarks ? (
                        <Bookmarks
                            onClose={this.props.onCloseModal}
                            bookmarks={this.props.book.bookmarks}
                        />
                    ) : (this.props.show.notes ? (
                        <Notes
                            book={this.props.book}
                            target={this.props.target}
                            onClose={this.props.onCloseModal}
                            updateBook={this.props.updateBook}
                        />
                    ) : (this.props.show.createNote ? (
                        <CreateNote
                            book={this.props.book}
                            onClose={this.props.onCloseModal}
                            updateBook={this.props.updateBook}
                        />
                    ) : (this.props.show.toc ? (
                        <TableOfContents
                            onClose={this.props.onCloseModal}
                        />
                    ) : (this.props.show.manageAnnotations ? (
                        <ManageAnnotations
                            book={this.props.book}
                            dispatch={this.props.dispatch}
                        />
                    ) : (this.props.show.more ? (
                        <More
                            onToggleShow={this.onToggleShow}
                        />
                    ) : (this.props.show.annotation ? (
                        <Annotation
                            book={this.props.book}
                            target={this.props.target}
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