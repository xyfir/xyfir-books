import React from "react";

// Action creators
import { loadBooks } from "../../../actions/creators/books";

// Modules
import loadBooksFromApi from "../../../lib/books/load-from-api";

// Components
import ByAuthorSort from "./ByAuthorSort";
import ByAuthors from "./ByAuthors";
import ByRating from "./ByRating";
import BySeries from "./BySeries";
import ByTag from "./ByTag";
//
import AuthorSort from "./AuthorSort";
import Authors from "./Authors";
import Ratings from "./Ratings";
import Series from "./Series";
import Tags from "./Tags";
import All from "./All";

export default class Books extends React.Component {

    constructor(props) {
        super(props);
        
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

    render() {
        const view = this.props.data.view.split('/');
        
        if (view[2] == "BY") {
            switch (this.props.data.view.split('/')[3]) {
                case "TAG":
                    return <ByTag data={this.props.data} dispatch={this.props.dispatch} />;
                case "RATING":
                    return <ByRating data={this.props.data} dispatch={this.props.dispatch} />;
                case "SERIES":
                    return <BySeries data={this.props.data} dispatch={this.props.dispatch} />;
                case "AUTHORS":
                    return <ByAuthors data={this.props.data} dispatch={this.props.dispatch} />;
                case "AUTHOR_SORT":
                    return <ByAuthorSort data={this.props.data} dispatch={this.props.dispatch} />;
            }
        }
        else {
            switch (this.props.data.view.split('/')[2]) {
                case "ALL":
                    return <All data={this.props.data} dispatch={this.props.dispatch} />;
                case "TAGS":
                    return <Tags data={this.props.data} dispatch={this.props.dispatch} />;
                case "RATINGS":
                    return <Ratings data={this.props.data} dispatch={this.props.dispatch} />;
                case "SERIES":
                    return <Series data={this.props.data} dispatch={this.props.dispatch} />;
                case "AUTHORS":
                    return <Authors data={this.props.data} dispatch={this.props.dispatch} />;
                case "AUTHOR_SORT":
                    return <AuthorSort data={this.props.data} dispatch={this.props.dispatch} />;
            }
        }
    }

}