import React from "react";

// Modules
import emToPixels from "lib/misc/em-to-pixels";

export default class DynamicIframe extends React.Component {

    constructor(props) {
        super(props);

        this._setHeight = this._setHeight.bind(this);
        this._getHeight = this._getHeight.bind(this);
    }

    componentDidMount() {
        this._setHeight();
    }

    _getHeight() {
        // Get positions for top/bottom/container elements
        const bottom = document.querySelector(
            this.props.bottom || this.props.container
        ).getBoundingClientRect();
        const top = document.querySelector(
            this.props.top || this.props.container
        ).getBoundingClientRect();
        
        // Calculate space between/inside element(s)
        // Subtract em from height if needed
        return Math.floor(
            bottom.top - top.bottom - Math.round(
                (this.props.substract || 0) * emToPixels()
            )
        );
    }

    _setHeight() {
        this.refs.frame.style.height = this._getHeight() + "px";
    }

    render() {
        return (
            <iframe
                ref="frame"
                src={this.props.src}
                width="100%"
                className={this.props.className}
            />
        );
    }

}