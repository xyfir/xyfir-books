import React from "react";

// Components
import NavBar from "../misc/NavBar";

// Constants
import initialState from "../../constants/initial-state";

// Action creators
import { setReader } from "../../actions/creators/settings";
import { save } from "../../actions/creators/";

export default class ReaderSettings extends React.Component {

    constructor(props) {
        super(props);
        
        this.state = this.props.data.config.reader;
        
        this.onReset = this.onReset.bind(this);
        this.onSave = this.onSave.bind(this);
    }
    
    onSave() {
        this.props.dispatch(setReader(this.state));
        this.props.dispatch(save("config"));
        
        swal("Saved", "Settings saved successfully", "success");
    }
    
    onReset() {
        this.setState(initialState.config.reader);
    }

    render() {
        return (
            <div className="settings-reader">
                <NavBar
                    home={true}
                    account={true}
                    title="Settings - Reader"
                    library={true}
                    settings={""}
                    books={true}
                />
                <div className="settings">
                    <section className="font-size">
                        <label>Font Size</label>
                        <input
                            type="number"
                            value={this.state.fontSize}
                            min="0.1" step="0.1"
                            onChange={(e) => this.setState({ fontSize: e.target.value })}
                        />
                        <span style={{fontSize: this.state.fontSize + "em"}}>
                            Example Text
                        </span>
                    </section>
                    
                    <section className="padding">
                        <label>Page Padding</label>
                        <input
                            type="number"
                            value={this.state.padding}
                            min="0" step="0.1"
                            onChange={(e) => this.setState({ padding: +e.target.value })}
                        />
                        <span
                            className="example"
                            style={{padding: `0em ${1 + this.state.padding}em` }}
                        >Example Text</span>
                    </section>
                    
                    <section className="font-color">
                        <label>Font Color</label>
                        <input
                            type="color"
                            value={this.state.color}
                            onChange={(e) => this.setState({ color: e.target.value })}
                        />
                        <label>Background Color</label>
                        <input
                            type="color"
                            value={this.state.backgroundColor}
                            onChange={(e) => this.setState({ backgroundColor: e.target.value })}
                        />
                        <span style={{
                            color: this.state.color,
                            backgroundColor: this.state.backgroundColor
                        }}>Example Text</span>
                    </section>
                    
                    <section className="highlight-color">
                        <label>Highlight Color</label>
                        <input
                            type="color"
                            value={this.state.highlightColor}
                            onChange={(e) => this.setState({ highlightColor: e.target.value })}
                        />
                        <span style={{
                            color: this.state.color,
                            backgroundColor: this.state.highlightColor
                        }}>Example Text</span>
                    </section>
                    
                    <section className="line-spacing">
                        <label>Line Spacing</label>
                        <input
                            type="number"
                            value={this.state.lineHeight}
                            min="1" step="0.1"
                            onChange={(e) => this.setState({ lineHeight: e.target.value })}
                        />
                        <div style={{lineHeight: this.state.lineHeight}}>
                            Line 1<br />Line 2<br />Line 3
                        </div>
                    </section>
                
                    <button onClick={this.onSave} className="btn-primary">
                        Save
                    </button>
                    
                    <button onClick={this.onReset} className="btn-danger">
                        Reset
                    </button>
                </div>
            </div>
        );
    }

}