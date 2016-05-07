// Action creators
import { changeView } from "../actions/creators/";

// Constants
import * as VIEWS from "../constants/views";

export default function(store) {

    // Hash is empty or not set    
    if (location.hash.length < 2) {
        store.dispatch(changeView(VIEWS.LIST_BOOKS));
        return;
    }

    const state = store.getState();
    const hash = location.hash.substr(1).split('/');

    // Update state to reflect hash
    if (hash[0] == "account") {
        if (hash[1] == "purchase-subscription")
            store.dispatch(changeView(VIEWS.PURCHASE_SUBSCRIPTION));
        else
            store.dispatch(changeView(VIEWS.ACCOUNT));
    }
    else if (hash[0] == "library") {
        switch (hash[1]) {
            case "download":
                return store.dispatch(changeView(VIEWS.LIBRARY_DOWNLOAD));
            case "upload":
                return store.dispatch(changeView(VIEWS.LIBRARY_UPLOAD));
            case "info":
                return store.dispatch(changeView(VIEWS.LIBRARY_INFO));
        }
    }
    else if (hash[0] == "books") {
        if (hash[1] == "list") {
            if (hash[3] === undefined) {
                switch (hash[2]) {
                    case "all":
                        return store.dispatch(changeView(VIEWS.LIST_BOOKS));
                    case "tags":
                        return store.dispatch(changeView(VIEWS.LIST_TAGS));
                    case "authors":
                        return store.dispatch(changeView(VIEWS.LIST_AUTHORS));
                    case "author-sort":
                        return store.dispatch(changeView(VIEWS.LIST_AUTHOR_SORT));
                    case "series":
                        return store.dispatch(changeView(VIEWS.LIST_SERIES));
                    case "ratings":
                        return store.dispatch(changeView(VIEWS.LIST_RATINGS));
                }
            }
            else {
                switch (hash[2]) {
                    case "tags":
                        return store.dispatch(changeView(VIEWS.LIST_BY_TAG));
                    case "authors":
                        return store.dispatch(changeView(VIEWS.LIST_BY_AUTHORS));
                    case "author-sort":
                        return store.dispatch(changeView(VIEWS.LIST_BY_AUTHOR_SORT));
                    case "series":
                        return store.dispatch(changeView(VIEWS.LIST_BY_SERIES));
                    case "ratings":
                        return store.dispatch(changeView(VIEWS.LIST_BY_RATING));
                }
            }
        }
        else {
            switch (hash[1]) {
                case "search":
                    return store.dispatch(changeView(VIEWS.SEARCH_BOOKS));
                case "metadata":
                    return store.dispatch(changeView(VIEWS.EDIT_METADATA));
                case "read":
                    return store.dispatch(changeView(VIEWS.READ_BOOK));
                case "upload":
                    return store.dispatch(changeView(VIEWS.UPLOAD_BOOKS));
            }
        }
    }
    
}