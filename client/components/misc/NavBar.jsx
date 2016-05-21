import React from "react";

export default class NavBar extends React.Component {

    constructor(props) {
        super(props);
    }
    
    render() { 
        const showText = window.screen.height < window.screen.width;
        
        return (
            <nav className="nav-bar">
                <div className="left">
                    {this.props.home ? (
                        <a href="#books/recently-opened">
                            <span
                                className="icon-home"
                                title="Home / Recently Opened"
                            />{showText ? " Home" : ""}
                        </a>
                    ) : (<a />)}
                    
                    {this.props.account ? (
                        <a href="#account">
                            <span
                                className="icon-user"
                                title="Account"
                            />{showText ? " Account" : ""}
                        </a>
                    ) : (<a />)}
                </div>
                
                <span className="title">{this.props.title}</span>
                
                <div className="right">
                    {this.props.library ? (
                        <a href="#library/info">
                            <span
                                className="icon-book"
                                title="Library"
                            />{showText ? " Library" : ""}
                        </a>
                    ) : (<a />)}
                    
                    {this.props.settings !== undefined ? (
                        <a href={`#settings/${
                            this.props.settings == "" ? "general" : this.props.settings
                        }`}>
                            <span
                                className="icon-settings"
                                title="Settings"
                            />{showText ? " Settings" : ""}
                        </a>
                    ) : (<a />)}
                    
                    {this.props.books ? (
                        <a href="#books/list">
                            <span
                                className="icon-book-open"
                                title="Book List"
                            />{showText ? " Books" : ""}
                        </a>
                    ) : (<a />)}
                </div>
            </nav>
        );
    }

}