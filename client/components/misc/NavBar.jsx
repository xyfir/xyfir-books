import React from "react";

// Modules
import showNavbarText from "lib/misc/show-navbar-text";

export default class NavBar extends React.Component {

    constructor(props) {
        super(props);
    }
    
    render() { 
        const showText = showNavbarText();
        
        return (
            <nav className="navbar top">
                <div className="left">
                    {this.props.home ? (
                        <a
                            href="#books/recently-opened"
                            title="Home / Recently Opened"
                            className="icon-home"
                        >{showText ? "Home" : ""}</a>
                    ) : (<a />)}
                    
                    {this.props.account ? (
                        <a
                            className="icon-user"
                            title="Account"
                            href="#account"
                        >{showText ? "Account" : ""}</a>
                    ) : (<a />)}

                    {this.props.settings !== undefined ? (
                        <a
                            href={`#settings/${
                                this.props.settings == "" ? "general" : this.props.settings
                            }`}
                            className="icon-settings"
                            title="Settings"
                        >{showText ? "Settings" : ""}</a>
                    ) : (<a />)}
                </div>
                
                <span className="title">{this.props.title}</span>
                
                <div className="right">
                    {this.props.library ? (
                        <a
                            className="icon-library"
                            title="Library"
                            href="#library/info"
                        >{showText ? "Library" : ""}</a>
                    ) : (<a />)}
                    
                    {this.props.books ? (
                        <a
                            className="icon-book"
                            title="Book List"
                            href="#books/list"
                        >{showText ? "Books" : ""}</a>
                    ) : (<a />)}
                </div>
            </nav>
        );
    }

}