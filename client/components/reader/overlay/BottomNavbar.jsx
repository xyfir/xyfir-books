import React from "react";

// Modules
import showNavbarText from "lib/misc/show-navbar-text";

export default class BottomReaderNavbar extends React.Component {

    constructor(props) {
        super(props);
    }

    onGoBackInHistory() {
        const r = this.props.reader;

        if (r.state.history.items.length && r.state.history.index) {
            const history = Object.assign({}, r.state.history);
            
            if (history.index == -1)
                history.index = history.items.length - 1;
            else
                history.index--;

            history.ignore = true;
            
            r.setState({ history });

            epub.gotoCfi(history.items[history.index]);
        }
    }

    render() {
        const showText = showNavbarText(), r = this.props.reader;
        
        if (!this.props.show) return <div />;

        return (
            <nav className="navbar bottom">
                <a
                    title="Go back"
                    onClick={() => this.onGoBackInHistory()}
                    disabled={
                        !r.state.history.items.length || !r.state.history.index
                    }
                    className="icon-history"
                >{showText ? "Back" : ""}</a>
            </nav>
        );
    }

}