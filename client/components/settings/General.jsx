import React from "react";

// Action creators
import { setTheme } from "../../actions/creators/settings";

// Components
import NavBar from "../misc/NavBar";

export default class GeneralSettings extends React.Component {

    constructor(props) {
        super(props);
        
        this.onClear = this.onClear.bind(this);
        this.onSave = this.onSave.bind(this);
    }
    
    onClear() {
        // Covers
        if (this.refs["clear-covers"].checked) {
            localforage.keys().then(keys => keys.forEach(key => {
                if (key.indexOf("cover-") == 0) {
                    localforage.removeItem(key)
                        .then(() => { return; }).catch((e) => { return; });
                }
            })).catch(err => {
                return;
            });
        }
        
        // ** Books
        if (this.refs["clear-books"].checked) {
            
        }
        
        // Metadata
        if (this.refs["clear-metadata"].checked) {
            localforage.removeItem("books")
                .then(() => { return; }).catch((e) => { return; });
        }
    }
    
    onSave() {
        const config = Object.assign({}, this.props.data.config);
        const theme = this.refs.theme.value;
        
        // ** Change CSS theme file
        
        this.props.dispatch(setTheme(theme));
        
        config.general = { theme };
        localforage.setItem("config", config)
            .then((c) => { return; }).catch((e) => { return; });
    }

    render() {
        const conf = this.props.data.config;
        
        return (
            <div className="settings-general">
                <NavBar
                    home={true}
                    account={true}
                    title="Settings - General"
                    library={true}
                    books={true}
                />
                
                <section className="main">
                    <label>Theme</label>
                    <select ref="theme" defaultValue={conf.general.theme}>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                    </select>
                
                    <button className="btn-primrary" onClick={this.onSave}>
                        Save Settings
                    </button>
                </section>
                
                <section className="storage">
                    <h2>Storage</h2>
                    <p>
                        While your Libyq library is stored in the cloud so you can access it from any device with an internet connection, we also store data on your device to both prevent unnecessary data usage and allow you to access most of your library while not connected to the internet.
                    </p>
                    
                    <hr />
                    
                    <h3>Clear Local Storage</h3>
                    <p>
                        Choose data to remove from your local storage. This data will still be available in the cloud and will be redownloaded and saved locally when you access it.
                    </p>
                    
                    <input type="checkbox" ref="clear-covers" />Book Covers
                    <input type="checkbox" ref="clear-books" />Book Files
                    <input type="checkbox" ref="clear-metadata" />Book Metadata
                    
                    <button className="btn-secondary" onClick={this.onClear}>
                        Clear Data
                    </button>
                </section>
            </div>
        );
    }

}