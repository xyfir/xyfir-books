import React from "react";
import { render } from "react-dom";

// Redux store / reducers
import { createStore } from "redux";
import reducers from "../reducers/";

// Components

// Modules
import ajax from "../lib/ajax";

// Constants
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

        const initialize = () => {
            let state = {};
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
                        history.pushState({}, '', URL + "");
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