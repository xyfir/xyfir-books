import React from "react";

export default class ReaderOverlay extends React.Component {

    constructor(props) {
        super(props);

        this.state = { status: "" };
    }

    onCycleHighlightMode() {
        clearTimeout(this.timeout);

        const hl = this.props.onCycleHighlightMode();
        let status = "";

        switch (hl.mode) {
            case "none":
                status = "Highlights turned off"; break;
            
            case "notes":
                status = "Now highlighting notes"; break;

            case "annotations":
                status = "Now highlighting annotations from set "
                    + this.props.book.annotations[hl.index].set_title;
                break;
        }

        // Notify user of new highlight mode for 5 seconds
        this.setState({ status });
        this.timeout = setTimeout(() => this.setState({ status: "" }), 5000);
    }

    render() {
        return (
            <div className="overlay">
                <div className="controls">
                    <div
                        className="previous-page"
                        onClick={() => epub.prevPage()}
                    />
                    <div
                        className="next-page"
                        onClick={() => epub.nextPage()}
                    />
                    <div
                        className="cycle-highlight-mode"
                        onClick={() => this.onCycleHighlightMode()}
                    />
                </div>
                
                <span className="status">{
                    this.state.status ? (
                        this.state.status
                    ) : this.props.loading ? (
                        "Loading..."
                    ) : (
                        this.props.percent + "% | " + (
                            !this.props.pagesLeft
                                ? "Last page in chapter"
                                : this.props.pagesLeft + " pages left in chapter"
                            )
                    ) 
                }</span>
            </div>
        );
    }

}