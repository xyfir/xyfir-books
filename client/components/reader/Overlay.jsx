import React from "react";

// Components
import BottomNavbar from "./overlay/BottomNavbar";
import TopNavbar from "./overlay/TopNavbar";
import Status from "./overlay/Status";

export default class ReaderOverlay extends React.Component {

    constructor(props) {
        super(props);

        this.state = { showNavbars: true };
    }

    componentDidMount() {
        setTimeout(() => {
            this.setState({ showNavbars: false });
        }, 3500);
    }
    
    _toggleShowNavbars() {
        this.setState({ showNavbars: !this.state.showNavbars });
    }

    render() {
        const p = this.props.parent;

        return (
            <div className="overlay">
                <TopNavbar
                    book={p.state.book}
                    show={this.state.showNavbars}
                    updateBook={p._updateBook}
                    onToggleShow={p.onToggleShow}
                />

                <Status
                    ref="status"
                    book={p.state.book}
                    loading={p.state.loading}
                    percent={p.state.percent}
                    pagesLeft={p.state.pagesLeft}
                />

                <BottomNavbar
                    book={p.state.book}
                    show={this.state.showNavbars}
                    updateBook={p._updateBook}
                    onToggleShow={p.onToggleShow}
                />
            </div>
        );
    }

}