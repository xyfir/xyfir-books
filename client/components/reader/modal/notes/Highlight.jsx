import React from 'react';

// react-md
import Slider from 'react-md/lib/Sliders';

export default class HighlightText extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      visibleText: this._getVisibleText(), start: 0, end: 0
    };
  }

  /**
   * Handle sliders.
   * @param {number} start
   * @param {number} end
   * @param {string} change - 'start|end'
   */
  onSlide(start, end, change) {
    let percent, slider;

    switch (change) {
      case 'start':
        end = start > end ? start : end,
        slider = this.refs.sliderEnd,
        percent = (end / this.state.visibleText.length) * 100;
        break;

      case 'end':
        start = start > end ? end : start,
        slider = this.refs.sliderStart,
        percent = (start / this.state.visibleText.length) * 100;
    }

    this.setState({ start, end });
    
    // react-md's slider does not update when the value prop changes and only
    // when the slider is interacted with directly
    slider.setState({
      trackFillWidth: percent + '%', thumbLeft: `calc(${percent}% - 6px)`
    });
  }

  /**
   * @returns {string[]}
   */
  _getHighlights() {
    if (this.state.start == this.state.end) {
      return [];
    }
    else {
      return this.state.visibleText
        .substring(this.state.start, this.state.end)
        .trim()
        .split('\n\n');
    }
  }

  /**
   * Returns all of the text content that is visible within the current page. 
   * Each would-be HTML element is separated by `\n\n`.
   * @returns {string}
   */
  _getVisibleText() {
    // Generate CFIs for beginning and end of visible page
    const cfiRange = epub.renderer.getVisibleRangeCfi();
    const doc = epub.renderer.render.document;

    // Create ranges for start and end of cfiRange
    const cfi = new EPUBJS.EpubCFI();
    const endRange = cfi.generateRangeFromCfi(cfiRange.end, doc);
    const startRange = cfi.generateRangeFromCfi(cfiRange.start, doc);

    // Create a new range to bring start and end ranges together
    const fullRange = document.createRange();
    if (startRange)
      fullRange.setStart(startRange.startContainer, startRange.startOffset);
    if (endRange)
      fullRange.setEnd(endRange.startContainer, endRange.startOffset);

    // Get the text content of the range
    return fullRange.toString();
  }

  render() {
    const visibleText = (
      this.state.visibleText.substring(0, this.state.start) +
      `<span style='background-color: yellow;'>${
        this.state.visibleText.substring(this.state.start, this.state.end)
      }</span>` +
      this.state.visibleText.substring(this.state.end)
    )
    .replace(/\n\n/g, '<br /><br />')

    return (
      <div className='highlight'>
        <div
          className='visible-text'
          dangerouslySetInnerHTML={{ __html: visibleText }}
        />

        <Slider
          id='slider--highlight-start'
          min={0}
          ref='sliderStart'
          max={this.state.visibleText.length}
          label='Highlight Start'
          value={this.state.start}
          onChange={v => this.onSlide(v, this.state.end, 'start')}
        />

        <Slider
          id='slider--highlight-end'
          min={0}
          ref='sliderEnd'
          max={this.state.visibleText.length}
          label='Highlight End'
          value={this.state.end}
          onChange={v => this.onSlide(this.state.start, v, 'end')}
        />
      </div>
    );
  }

}