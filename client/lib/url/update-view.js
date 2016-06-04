// Action creators
import { changeView } from "../../actions/creators/";

// Constants
import * as VIEWS from "../../constants/views";

export default function(store) {

    // Hash is empty or not set    
    if (location.hash.length < 2) {
        store.dispatch(changeView(VIEWS.RECENTLY_OPENED));
        return;
    }

    const state = store.getState();
    const hash = location.hash.substr(1).split('?')[0].split('/');

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
                default:
                    return store.dispatch(changeView(VIEWS.LIST));
            }
        }
        else {
            switch (hash[1]) {
                case "recently-opened":
                    return store.dispatch(changeView(VIEWS.RECENTLY_OPENED));
                case "add-format":
                    return store.dispatch(changeView(VIEWS.ADD_FORMAT));
                case "bulk-edit":
                    return store.dispatch(changeView(VIEWS.BULK_EDIT));
                case "manage":
                    return store.dispatch(changeView(VIEWS.MANAGE_BOOK));
                case "read":
                    return store.dispatch(changeView(VIEWS.READ_BOOK));
                case "upload":
                    return store.dispatch(changeView(VIEWS.UPLOAD_BOOKS));
            }
        }
    }
    else if (hash[0] == "settings") {
        switch (hash[1]) {
            case "book-list":
                return store.dispatch(changeView(VIEWS.BOOK_LIST_SETTINGS));
            case "general":
                return store.dispatch(changeView(VIEWS.GENERAL_SETTINGS));
            case "reader":
                return store.dispatch(changeView(VIEWS.READER_SETTINGS));
        }
    }
    
}