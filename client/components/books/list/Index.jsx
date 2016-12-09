import React from "react";

// Action creators
import { setListView } from "actions/creators/settings";
import { loadBooks } from "actions/creators/books";

// Modules
import showNavbarText from "lib/misc/show-navbar-text";
import parseHashQuery from "lib/url/parse-hash-query";

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
    }
    
    onToggleShowViewSelector() {
        this.setState({ showViewSelector: !this.state.showViewSelector });
    }
    
    onSelectView(i) {
        this.props.dispatch(setListView(
            ["", "table", "grid", "compact"][i]
        ));
        this.onToggleShowViewSelector();
    }

    render() {
        let view, title = "";
        
        switch (this.props.data.view.split('/')[2]) {
            case "ALL":
                view = <All {...this.props} />; break;
            case "TAGS":
                view = <SubGroups
                            {...this.props}
                            group="tags"
                            queryKey="tag"
                        />;
                title = "Tags"; break;
            case "RATINGS":
                view = <SubGroups
                            {...this.props}
                            group="ratings"
                            queryKey="rating"
                        />;
                title = "Ratings"; break;
            case "SERIES":
                view = <SubGroups {...this.props} group="series" />;
                title = "Series"; break;
            case "AUTHORS":
                view = <SubGroups {...this.props} group="authors" />;
                title = "Authors"; break;
            case "AUTHOR_SORT":
                view = <SubGroups {...this.props} group="author_sort" />;
                title = "Author Sort"; break;
            default:
                view = <Groups {...this.props} />;
                title = "List Groups";
        }
        
        // User is at #books/list/all[?x=y]
        if (title == "") {
            const qo = parseHashQuery();
            
            // User is viewing all books
            if (!qo.search) {
                title = "All Books";
            }
            // User is viewing all books that match x=y
            else {
                delete qo.search;
                const qa = Object.keys(qo);

                switch (qa[0]) {
                    case "tag": title = "Tag (" + qo[qa[0]] + ")"; break;
                    case "rating": title = qo[qa[0]]; break; 
                    default: title = qo[qa[0]];
                }
            }
        }
        
        const showText = showNavbarText();
        
        return (
            <div className="list">
                <nav className="nav-bar">
                    <div className="left">
                        <a
                            className="icon-home"
                            title="Home / Recently Opened"
                            href="#books/recently-opened"
                        >{showText ? "Home" : ""}</a>

                        <a
                            className="icon-upload"
                            title="Upload Books"
                            href="#books/upload"
                        >{showText ? "Upload" : ""}</a>
                    </div>
                    
                    <span className="title">{title}</span>
                    
                    <div className="right">
                        <a
                            onClick={this.onToggleShowViewSelector}
                            className="icon-view-mode"
                            title="Select View Mode"
                        >{showText ? "Set View" : ""}</a>

                        <a
                            className="icon-book-open"
                            title="Book List"
                            href="#books/list"
                        >{showText ? "Books" : ""}</a>
                    </div>
                </nav>
                
                {this.state.showViewSelector ? (
                    <div className="modal view-selector">
                        <span
                            title="Close"
                            onClick={this.onToggleShowViewSelector}
                            className="icon-close"
                        />
                        <dl>
                            <dt><a onClick={() => this.onSelectView(1)}>
                                Table View
                            </a></dt>
                            <dd>
                                Lots of data, not recommended for mobile. Sorting by column features available.
                            </dd>
                            
                            <dt><a onClick={() => this.onSelectView(2)}>
                                Grid View
                            </a></dt>
                            <dd>
                                Recommended for tablets. Mimal data, large covers.
                            </dd>
                            
                            <dt><a onClick={() => this.onSelectView(3)}>
                                Compact View
                            </a></dt>
                            <dd>Fits well on any device.</dd>
                        </dl>
                    </div>
                ) : (
                    <div />
                )}
                
                {view}
            </div>
        );
    }

}