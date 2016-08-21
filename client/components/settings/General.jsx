import React from "react";

// Action creators
import { setTheme } from "actions/creators/settings";
import { save } from "actions/creators/index";

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
        const theme = this.refs.theme.value;
        
        document.body.className = "theme-" + theme;
        
        this.props.dispatch(setTheme(theme));
        this.props.dispatch(save("config"));
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
                
                    <button className="btn-primary" onClick={this.onSave}>
                        Save Settings
                    </button>
                </section>
                
                <hr />
                
                <section className="storage">
                    <h2>Clear Local Storage</h2>
                    <p>
                        Choose data to remove from your local storage. This data will still be available in the cloud and will be redownloaded and saved locally when you access it.
                    </p>
                    
                    <button className="btn-secondary" onClick={this.onClear}>
                        Clear Data
                    </button>
                    
                    <div>
                        <input type="checkbox" ref="clear-covers" />Book Covers
                        <input type="checkbox" ref="clear-books" />Book Files
                        <input type="checkbox" ref="clear-metadata" />Book Metadata
                    </div>
                </section>
            </div>
        );
    }

}