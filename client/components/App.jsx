import React from "react";
import { render } from "react-dom";

// Redux store / reducers
import { createStore } from "redux";
import reducers from "../reducers/";

// Components

// Modules
import setState from "../lib/set-state";
import ajax from "../lib/ajax";

// Constants
import { INITIALIZE_STATE } from "../actions/types/";
import { LIST_BY_ALL } from "../constants/views";
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

        const initialize = (state) => {
            // Set state where needed
            if (state !== undefined) {
                this.state = state;

                // Push initial state to store
                store.dispatch({
                    type: INITIALIZE_STATE, state
                });

                // Set state based on current url hash
                setState(store);
                
                // Update state when url hash changes
                window.onhashchange = () => setState(store);
                
                return;
            }
            
            state = {
                books: [], view: LIST_BY_ALL, account: {
                    subscription: 0, library: {
                        address: "", id: ""
                    }
                }
            };
            
            // Load initial data from API
            if (navigator.onLine) {
                ajax({
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
            
            ajax({
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
            
        }
        
        return (
            <div className="libyq">
            
            </div>
        );
    }

}

render(<App />, document.getElementById("content"));