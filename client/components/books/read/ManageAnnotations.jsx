import marked from "marked";
import React from "react";

// Modules
import request from "../../../lib/request/";

// Constants
import { LIB_ANN } from "../../../constants/config";

// Actions
import { updateBook } from "../../../actions/creators/books";
import { save } from "../../../actions/creators/";

export default class ManageAnnotations extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            sets: [], view: 0
        };
    }

    onViewSet(id) {
        this.setState({ view: id });
    }

    onSearch(query) {
        clearTimeout(this.searchTimeout);

        this.searchTimeout = setTimeout(() => {
            request({
                url: LIB_ANN + "sets?sort=top&search=" + this.refs.search.value,
                success: (res) => this.setState(res)
            });
        }, 200);
    }

    onDownload() {
        let annotations = this.props.book.annotations.slice(0);

        annotations.push(this.state.sets.find(set => {
            return set.id == this.state.view;
        }));

        this.props.dispatch(updateBook(this.props.book.id, { annotations }));
        this.props.dispatch(save("books"));
    }

    onDelete() {
        // Remove set from book.annotations
        this.props.dispatch(updateBook(
            this.props.book.id,
            { annotations: this.props.book.annotations.filter(a => {
                return a.id != this.state.view;
            })}
        ));
        this.props.dispatch(save("books"));

        this.setState({ view: 0 });
    }

    render() {
        if (this.state.set) {
            const isDownloaded = !!this.props.book.annotations.find(a => {
                return a.id == this.state.view
            });
            let set = {};

            if (isDownloaded)
                set = this.props.book.annotations.find(a => a.id == this.state.view);
            else
                set = this.state.sets.find(a => a.id == this.state.view);

            <div className="view-annotation-set">
                {isDownloaded ? (
                    <a
                        onClick={() => this.onDelete()}
                        className="link-lg"
                    >Delete Annotation Set</a>
                ) : (
                    <a
                        onClick={() => this.onDownload()}
                        className="link-lg"
                    >Download Annotation Set</a>
                )}
                
                <h3 className="title">{set.set_title}</h3>
                <span className="book">
                    <span className="title">{set.book_title}</span>
                    <span className="authors">{set.book_authors}</span>
                </span>
                <div
                    className="markdown description"
                    dangerouslySetInnerHTML={{
                        __html: marked(
                            set.set_description, { sanitize: true }
                        )
                    }}
                />
            </div>
        }
        else {
            return (
                <div className="manage-annotations">
                    <h3>Downloaded Annotation Sets</h3>
                    <p>
                        The order in which your chosen annotation sets are downloaded affect the way annotations are displayed while reading.
                        <br />
                        If multiple annotation sets have annotations for the same selection of text, the set that was chosen first will be the one that gives the text its annotations.
                    </p>
                    <div className="downloaded-annotations">{
                        this.props.book.annotations.map(a => {
                            return (
                                <div className="annotation-set">
                                    <a
                                        onClick={() => this.onViewSet(a.id)}
                                        className="title"
                                    >{a.title}</a>
                                    <span className="description">{
                                        a.description
                                    }</span>
                                    <span className="contains">
                                        Set contains {a.items.length} annotations
                                    </span>
                                </div>
                            );
                        })
                    }</div>

                    <hr />

                    <h3>Find Annotation Sets</h3>
                    <input
                        ref="search"
                        type="text"
                        onChange={(e) => this.onSearch()}
                        placeholder="Search..."
                    />
                    <div className="find-annotations">{
                        this.state.sets.map(a => {
                            return (
                                <div className="annotation-set">
                                    <a
                                        onClick={() => this.onViewSet(a.id)}
                                        className="title"
                                    >{a.title}</a>
                                    <span className="description">{
                                        a.description
                                    }</span>
                                </div>
                            );
                        })
                    }</div>
                </div>
            );
        }
    }

}