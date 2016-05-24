import React from "react";
import { render } from "react-dom";

// Redux store / reducers
import { createStore } from "redux";
import reducers from "../reducers/";

// Components
import Settings from "./settings/";
import Account from "./account/";
import Library from "./library/";
import Books from "./books/";

// Modules
import updateView from "../lib/url/update-view";
import request from "../lib/request/";

// Constants
import { INITIALIZE_STATE } from "../actions/types/";
import { LIST_BOOKS } from "../constants/views";
import { URL, XACC } from "../constants/config";

const store = createStore(reducers);

class App extends React.Component {

    constructor(props) {
        super(props);

        store.subscribe(() => {
            this.setState(store.getState());
        });

        if (location.href.indexOf("http://localhost") == 0) {
            store.subscribe(() => {
                console.log(store.getState());
            });
        }
        
        // Configure localForage
        localforage.config({
            driver: localforage.INDEXEDDB,
            name: "Libyq"
        });

        const initialize = (state) => {
            // Set state where needed
            if (state !== undefined) {
                // Grab config from local storage if available
                localforage.getItem("config").then(config => {
                    if (config != null) state.config = config;
                        
                    this.state = state;

                    // Push initial state to store
                    store.dispatch({
                        type: INITIALIZE_STATE, state
                    });

                    // Set state.view based on current url hash
                    updateView(store);
                    
                    // Update state.view when url hash changes
                    window.onhashchange = () => updateView(store);
                }).catch(err => {
                    swal("Error", "Could not load user settings", "error");
                });
                
                return;
            }
            
            state = {
                books: [], view: LIST_BOOKS, account: {
                    subscription: 0, library: {
                        address: "", id: ""
                    }
                }, search: "", config: {
                    general: {
                        theme: "light"
                    },
                    bookList: {
                        view: "compact", table: {
                            columns: [
                                "title", "authors", "series", "added", "rating"
                            ], defaultSort: {
                                column: "title", asc: true
                            }
                        }
                    }
                }
            };
            
            // Load initial data from API
            if (navigator.onLine) {
                request({
                    url: URL + "api/account", success: (res) => {
                        state.account = res;
                        
                        initialize(state);
                    }
                })
            }
            // Attempt to pull data from local storage
            else {
                localforage.getItem("account").then(account => {
                    if (account === null) {
                        swal("Error", "Could not load data from cloud or local storage", "error");
                    }
                    else {
                        state.account = account;
                        
                        localforage.getItem("books").then(books => {
                            state.books = books || [];
                            
                            initialize(state);
                        }).catch(err => {
                            swal("Error", "Could not load books from local storage", "error");
                        });
                    }
                }).catch(err => {
                    swal("Error", "Could not load data from cloud or local storage", "error");
                });
            }
        };

        // Attempt to login using XID/AUTH or skip to initialize()
        if (location.href.indexOf("xid=") > -1 && location.href.indexOf("auth=") > -1) {
            // Login using XID/AUTH_TOKEN
            const xid = location.href.substring(
                location.href.lastIndexOf("?xid=") + 5,
                location.href.lastIndexOf("&auth")
            );
            const auth = location.href.substring(
                location.href.lastIndexOf("&auth=") + 6
            );
            
            request({
                url: URL + "api/account/login",
                method: "POST",
                data: { xid, auth },
                success: (res) => {
                    if (res.error ) {
                        location.href = XACC + "login/14";
                    }
                    else {
                        initialize();
                        history.pushState({}, '', URL + "library/");
                    }
                }
            });
        }
        else {
            initialize();
        }        
    }

    render() {
        if (!this.state) return <div />;
        
        let view;

        switch (this.state.view.split('/')[0]) {
            case "SETTINGS":
                view = <Settings data={this.state} dispatch={store.dispatch} />; break;
            case "ACCOUNT":
                view = <Account data={this.state} dispatch={store.dispatch} />; break;
            case "LIBRARY":
                view = <Library data={this.state} dispatch={store.dispatch} />; break;
            case "BOOKS":
                view = <Books data={this.state} dispatch={store.dispatch} />;
        }
        
        return (
            <div className="libyq">
                {view}
            </div>                
        );
    }

}

render(<App />, document.getElementById("content"));