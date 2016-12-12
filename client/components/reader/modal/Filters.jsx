import Slider from "rc-slider";
import React from "react";

export default class Filters extends React.Component {

    constructor(props) {
        super(props);

        this.state = { loading: true };

        this.props.reader._getFilters(f => {
            this.setState(Object.assign({}, f, { loading: false }))
        });
    }

    onUpdate(prop, val) {
        clearTimeout(this.timeout);

        this.timeout = setTimeout(() => {
            const filters = Object.assign({}, this.state);
            
            filters[prop] = val;

            this.props.reader._applyFilters(filters);
            this.setState(filters);
        }, 100);
    }

    componentWillUnmount() {
        localforage.setItem(
            "filters-" + this.props.reader.state.book.id,
            this.state
        );
    }

    render() {
        if (this.state.loading) return <div />
        
        return (
            <div className="filters">
                <div className="slider">
                    <span className="icon-light-down" />
                    <div className="slider-container">
                        <Slider
                            tipTransitionName="rc-slider-tooltip-zoom-down"
                            defaultValue={this.state.brightness}
                            onChange={(v) => this.onUpdate("brightness", v)}
                            min={50} max={100}
                        />
                    </div>
                    <span className="icon-light-up" />
                </div>

                <div className="slider">
                    <span className="icon-snow" />
                    <div className="slider-container">
                        <Slider
                            tipTransitionName="rc-slider-tooltip-zoom-down"
                            defaultValue={this.state.warmth}
                            onChange={(v) => this.onUpdate("warmth", v)}
                            min={0} max={100}
                        />
                    </div>
                    <span className="icon-fire" />
                </div>

                <div className="slider">
                    <span className="icon-circle-empty" />
                    <div className="slider-container">
                        <Slider
                            tipTransitionName="rc-slider-tooltip-zoom-down"
                            defaultValue={this.state.contrast}
                            onChange={(v) => this.onUpdate("contrast", v)}
                            min={50} max={150}
                        />
                    </div>
                    <span className="icon-contrast" />
                </div>
            </div>
        )
    }

}