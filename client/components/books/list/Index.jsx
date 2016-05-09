import React from "react";

// Action creators
import { setListView } from "../../../actions/creators/config/bookList";
import { loadBooks } from "../../../actions/creators/books";

// Modules
import loadBooksFromApi from "../../../lib/books/load-from-api";
import parseHashQuery from "../../../lib/url/parse-hash-query";

// Components
import SubGroups from "./SubGroups";
import Groups from "./Groups";
//
import All from "./All";

export default class List extends React.Component {

    constructor(props) {
        super(props);
        
        this.state = { showViewSelector: false };
        
        this.onToggleShowViewSelector = this.onToggleShowViewSelector.bind(this);
        
        // Determine if state.books needs to be loaded from API or LS
        if (!this.props.data.books.length) {
            // Load from API
            if (navigator.onLine) {
                loadBooksFromApi(this.props.data.account.library, this.props.dispatch);
            }
            // Load from local storge
            else {
                localforage.getItem("books").then(books => {
                    this.props.dispatch(loadBooks(books || []));
                }).catch(err => {
                    swal("Error", "Could not load books from local storage", "error");
                });
            }
        }
    }
    
    onToggleShowViewSelector() {
        this.setState({ showViewSelector: !this.state.showViewSelector });
    }
    
    onSelectView(i) {
        this.props.dispatch(setListView(
            ["table", "grid", "compact"][i]
        ));
    }

    render() {
        let view, title = "";
        
        switch (this.props.data.view.split('/')[2]) {
            case "ALL":
                view = <All data={this.props.data} dispatch={this.props.dispatch} />; break;
            case "TAGS":
                view = <SubGroups
                            data={this.props.data}
                            dispatch={this.props.dispatch}
                            group="tags"
                            queryKey="tag"
                        />;
                title = "Tags"; break;
            case "RATINGS":
                view = <SubGroups
                            data={this.props.data}
                            dispatch={this.props.dispatch}
                            group="ratings"
                            queryKey="rating"
                        />;
                title = "Ratings"; break;
            case "SERIES":
                view = <SubGroups
                            data={this.props.data}
                            dispatch={this.props.dispatch}
                            group="series"
                        />;
                title = "Series"; break;
            case "AUTHORS":
                view = <SubGroups
                            data={this.props.data}
                            dispatch={this.props.dispatch}
                            group="authors"
                        />;
                title = "Authors"; break;
            case "AUTHOR_SORT":
                view = <SubGroups
                            data={this.props.data}
                            dispatch={this.props.dispatch}
                            group="author_sort"
                        />;
                title = "Author Sort"; break;
            default:
                view = <Groups data={this.props.data} dispatch={this.props.dispatch} />;
                title = "List Groups";
        }
        
        // User is at #books/list/all[?x=y]
        if (title == "") {
            const qo = parseHashQuery();
            const qa = Object.keys(qo);
            
            // User is viewing all books
            if (qa.length == 0) {
                title = "All Books";
            }
            // User is viewing all books that match x=y
            else {
                switch (qa[0]) {
                    case "tag": title = "Tag (" + qo[qa[0]] + ")"; break;
                    case "rating": title = qo[qa[0]] + " Stars"; break; 
                    default: title = qo[qa[0]];
                }
            }
        }
        
        return (
            <div className="list">
                <nav className="nav-bar">
                    <a
                        className="icon-home"
                        href="#books/recently-opened"
                        title="Home / Recently Opened"
                    />
                    <span className="list-title">{title}</span>
                    <a
                        className="icon-upload"
                        href="#books/upload"
                        title="Upload Books"
                    />
                    <a
                        className="icon-view-mode"
                        onClick={this.onToggleShowViewSelector}
                        title="Select View Mode"
                    />
                    <a
                        className="icon-book-open"
                        href="#books/list"
                        title="Books List"
                    />
                </nav>
                
                { // List view selector modal
                    this.state.showViewSelector
                    ? (
                        <div className="modal view-selector">
                            <dl>
                                <dt><a onClick={this.onSelectView.bind(this, 1)}>Table View</a></dt>
                                <dd>Not recommended for mobile. Lots of data. Sorting by column features available.</dd>
                                <dt><a onClick={this.onSelectView.bind(this, 2)}>Grid View</a></dt>
                                <dd>Recommended for tablets. Mimal data, large covers.</dd>
                                <dt><a onClick={this.onSelectView.bind(this, 3)}>Compact View</a></dt>
                                <dd>Fits well on any device.</dd>
                            </dl>
                        </div>
                    ) : <div />
                }
                
                {view}
            </div>
        );
    }

}