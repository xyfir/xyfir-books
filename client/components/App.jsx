import React from "react";
import { render } from "react-dom";

// Redux store / reducers
import { createStore } from "redux";
import reducers from "reducers/index";

// Components
import DynamicStyles from "./misc/DynamicStyles";
import Settings from "./settings/Index";
import Account from "./account/Index";
import Library from "./library/Index";
import Books from "./books/Index";

// Modules
import loadBooksFromApi from "lib/books/load-from-api";
import parseHashQuery from "lib/url/parse-hash-query";
import updateView from "lib/url/update-view";
import request from "lib/request/index";

// Constants
import initialState from "constants/initial-state";
import { INITIALIZE_STATE } from "actions/types/index";
import { URL, XACC, LOG_STATE, ENVIRONMENT } from "constants/config";

// Action creators
import { save } from "actions/creators/index";

const store = createStore(reducers);

class App extends React.Component {

    constructor(props) {
        super(props);
        
        this._addStoreSubscribers = this._addStoreSubscribers.bind(this);
        this._initialize = this._initialize.bind(this);
        this._login = this._login.bind(this);
        
        // Configure localForage
        localforage.config({
            driver: [localforage.INDEXEDDB, localforage.WEBSQL],
            name: "Libyq"
        });
        
        this._addStoreSubscribers();
        this._login();        
    }
    
    _initialize(state) {
        // Set state where needed
        if (state !== undefined) {
            // Grab config from local storage if available
            localforage.getItem("config").then(config => {
                if (config != null) state.config = config;
                    
                this.state = state;

                // Set theme
                document.body.className = "theme-" + state.config.general.theme;

                // Push initial state to store
                store.dispatch({
                    type: INITIALIZE_STATE, state
                });

                // Set state.view based on current url hash
                updateView(store);
                
                // Update state.view when url hash changes
                window.onhashchange = () => updateView(store);
                
                // Save state.account, state.books to local storage
                if (navigator.onLine) {
                    store.dispatch(save("account"));
                    store.dispatch(save("books"));
                }
            }).catch(err => {
                swal("Error", "Could not load user settings", "error");
            });
        }
        else {
            state = Object.assign({}, initialState);
        
            // Load initial data from API
            if (navigator.onLine) {
                // Access token is generated upon a successful login
                // Used to create new session without forcing login each time
                const token = localStorage.getItem("access_token") || "";

                // Access token is required
                if (!token && ENVIRONMENT != "dev") {
                    location.href = XACC + "login/14";
                }

                request({
                    url: URL + "api/account?token=" + token, success: account => {
                        // User not logged in
                        if (!account.library) {
                            location.href = XACC + "login/14";
                        }
                        
                        state.account = account;
                        
                        loadBooksFromApi(account.library, null, books => {
                            state.books = books;
                            this._initialize(state);
                        });
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
                            
                            this._initialize(state);
                        }).catch(err => {
                            swal("Error", "Could not load books from local storage", "error");
                        });
                    }
                }).catch(err => {
                    swal("Error", "Could not load data from cloud or local storage", "error");
                });
            }
        }
    }
    
    _addStoreSubscribers() {
        store.subscribe(() => {
            const state = store.getState();
            
            this.setState(state);
            
            if (LOG_STATE)
                console.log(state);
            
            if (state.save) {
                localforage.setItem(state.save, state[state.save]);
                store.dispatch(save(""));
            }
        });
    }
    
    _login() {
        const q = parseHashQuery();

        // PhoneGap app opens to vynote.com/workspace/#?phonegap=1
        if (q.phonegap) {
            localStorage.setItem("isPhoneGap", "true");
            location.hash = "";
            this._initialize();
        }
        // Attempt to login using XID/AUTH or skip to initialize()
        else if (q.xid && q.auth) {
            q.affiliate = localStorage.getItem("affiliate") || "";
            q.referral = localStorage.getItem("referral") || "";
            
            request({
                url: URL + "api/account/login", method: "POST", data: q,
                success: (res) => {
                    if (res.error) {
                        location.href = XACC + "login/14";
                    }
                    else {
                        localStorage.setItem("access_token", res.accessToken);
                        this._initialize();
                        location.hash = location.hash.split('?')[0];
                    }
                }
            });
        }
        else {
            this._initialize();
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
                <DynamicStyles beforeApp={true} />
                {view}
            </div>                
        );
    }

}

render(<App />, document.getElementById("content"));