import React from "react";

export default class ReaderOverlay extends React.Component {

    constructor(props) {
        super(props);
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
                </div>
                
                <span
                    onClick={() => this.props.onToggleShow("annotations")}
                    className="status"
                >{
                    this.props.loading ? (
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