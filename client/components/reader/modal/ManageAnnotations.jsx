import marked from "marked";
import React from "react";

// Modules
import request from "lib/request/index";

// Constants
import { XYFIR_ANNOTATIONS } from "constants/config";

export default class ManageAnnotations extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            key: this.props.data.config.reader.annotationsKey,
            sets: [], view: 0
        };

        this.onDownload = this.onDownload.bind(this);
        this.onDelete = this.onDelete.bind(this);
    }

    onViewSet(id) {
        this.setState({ view: id });
    }

    onSearch(query) {
        clearTimeout(this.searchTimeout);

        this.searchTimeout = setTimeout(() => {
            request({
                url: XYFIR_ANNOTATIONS + "sets?sort=top&search=" + this.refs.search.value,
                success: (res) => this.setState(res)
            });
        }, 200);
    }

    onDownload() {
        let annotations = this.props.book.annotations.slice(0);

        let set = this.state.sets.find(set => {
            return set.id == this.state.view;
        });

        const url = `${XYFIR_ANNOTATIONS}annotations?key=${this.state.key}&sets=${set.id}`;

        // Download set's items
        request({url, success: (res) => {
            if (res.error || !res[set.id] || !res[set.id].items) {
                swal("Error", "Could not download set", "error");
            }
            else {
                set.items = res[set.id].items;

                annotations.push(set);

                this.props.updateBook({ annotations });
                this.setState({ view: 0 });

                // Ensure current book's highlighted content is updated
                this.props.onCycleHighlightMode();
            }
        }});
    }

    onDelete() {
        const annotations = this.props.book.annotations.filter(a => {
            return a.id != this.state.view;
        });

        // Remove set from book.annotations
        this.props.updateBook({ annotations });
        this.setState({ view: 0 });

        // Ensure current book's highlighted content is updated
        this.props.onCycleHighlightMode();
    }

    render() {
        if (this.state.view) {
            const isDownloaded = !!this.props.book.annotations.find(a => {
                return a.id == this.state.view
            });
            let set = {};

            if (isDownloaded)
                set = this.props.book.annotations.find(a => a.id == this.state.view);
            else
                set = this.state.sets.find(a => a.id == this.state.view);

            return (
                <div className="view-annotation-set">
                    <span
                        className="icon-back"
                        onClick={() => this.onViewSet(0)}
                        title="Back to Annotations"
                    />

                    {isDownloaded ? (
                        <a onClick={this.onDelete}>
                            Delete Annotation Set
                        </a>
                    ) : (
                        <a onClick={this.onDownload}>
                            Download Annotation Set
                        </a>
                    )}
                    
                    <h3 className="title">{set.set_title}</h3>
                    <span className="book">
                        {set.book_title}, {set.book_authors}
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
            );
        }
        else {
            return (
                <div className="manage-annotations">
                    <h3>Downloaded Annotation Sets</h3>
                    {/*<p>
                        The order in which your chosen annotation sets are downloaded affect the way annotations are displayed while reading.
                        <br />
                        If multiple annotation sets have annotations for the same selection of text, the set that was chosen first will be the one that gives the text its annotations.
                    </p>*/}
                    {this.state.key ? "" : (
                        <p>
                            <strong>Note:</strong> You have not set a <a href="https://annotations.xyfir.com/" target="_blank">Xyfir Annotations</a> subscription key. If you have a key, you can set it in your <a href="#settings/reader">reader settings</a>.
                        </p>
                    )}
                    <div className="downloaded-annotations">{
                        this.props.book.annotations.map(a => {
                            return (
                                <div className="annotation-set">
                                    <a
                                        onClick={() => this.onViewSet(a.id)}
                                        className="title"
                                    >{a.set_title}</a>
                                    <span className="description">{
                                        a.set_description
                                    }</span>
                                    <span className="contains">
                                        Contains {a.items.length} annotations
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
                                    >{a.set_title}</a>
                                    <span className="description">{a.set_description}</span>
                                    <span className="book">
                                        {a.book_title}, {a.book_authors}
                                    </span>
                                </div>
                            );
                        })
                    }</div>
                </div>
            );
        }
    }

}