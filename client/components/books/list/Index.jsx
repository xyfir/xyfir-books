import React from "react";

// Action creators
import { loadBooks } from "../../../actions/creators/books";

// Modules
import loadBooksFromApi from "../../../lib/books/load-from-api";

// Components
import AuthorSort from "./group/AuthorSort";
import Authors from "./group/Authors";
import Ratings from "./group/Ratings";
import Series from "./group/Series";
import Groups from "./group/Groups";
import Tags from "./group/Tags";
//
import All from "./All";

export default class BooksList extends React.Component {

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
            default:
                return <Groups data={this.props.data} dispatch={this.props.dispatch} />;
        }
    }

}