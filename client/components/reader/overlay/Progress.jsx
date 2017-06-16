import PropTypes from 'prop-types';
import React from 'react';

// react-md
import Slider from 'react-md/lib/Sliders';

export default class ReaderProgressSlider extends React.Component {

  constructor(props) {
    super(props);

    this.state = { percent: this.props.reader.state.percent };
  }

  /**
   * Save percent to state.
   * @param {object} props 
   */
  componentWillReceiveProps(props) {
    const percent = props.reader.state.percent;

    this.setState({ percent });

    // react-md's slider does not update when the value prop changes and only
    // when the slider is interacted with directly
    this.refs.slider.setState({
      trackFillWidth: percent + '%',
      thumbLeft: `calc(${percent}% - 6px)`
    });
  }

  /**
   * Set state and go to percent.
   * @param {number} p
   */
  onGoToPercent(p) {
    this.setState({ percent: p });

    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => epub.gotoPercentage(p / 100), 100);
  }

  render() {
    return (
      <div
        className={
          'progress-slider' + (this.props.show ? '' : ' hidden')
        }
      >
        <Slider
          id='slider--progress'
          ref='slider'
          min={0}
          max={100}
          value={this.state.percent}
          onChange={p => this.onGoToPercent(p)}
        />
      </div>
    );
  }

}

ReaderProgressSlider.propTypes = {
  show: PropTypes.bool.isRequired,
  reader: PropTypes.object.isRequired
};