import { Slider } from 'react-md';
import PropTypes from 'prop-types';
import React from 'react';

export default class ReaderProgressSlider extends React.Component {
  constructor(props) {
    super(props);
  }

  /** @param {number} percent */
  onGoToPercent(percent) {
    const { Reader } = this.props;

    Reader.setState({ percent });

    clearTimeout(this.timeout);
    this.timeout = setTimeout(
      () =>
        Reader.book.rendition.display(
          Reader.book.locations.cfiFromPercentage(percent / 100)
        ),
      100
    );
  }

  render() {
    const { Reader } = this.props;

    return (
      <div
        className={
          'progress-slider md-background--primary' +
          (this.props.show ? '' : ' hide')
        }
      >
        <Slider
          id="slider--progress"
          ref="slider"
          min={0}
          max={100}
          value={Reader.state.percent}
          onChange={p => this.onGoToPercent(p)}
        />
      </div>
    );
  }
}

ReaderProgressSlider.propTypes = {
  show: PropTypes.bool.isRequired,
  Reader: PropTypes.object.isRequired
};
