import { Slider } from 'react-md';
import React from 'react';

export default class HighlightText extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      visibleText: this._getVisibleText(), start: 0, end: 0
    },
    this.state.end = this.state.visibleText.indexOf('\n');
  }

  /**
   * Handle sliders.
   * @param {number} start
   * @param {number} end
   * @param {string} change - 'start|end'
   */
  onSlide(start, end, change) {
    let percent;

    switch (change) {
      case 'start':
        end = start > end ? start : end,
        percent = (end / this.state.visibleText.length) * 100;
        break;

      case 'end':
        start = start > end ? end : start,
        percent = (start / this.state.visibleText.length) * 100;
    }

    this.setState({ start, end });
  }

  /** @return {string[]} */
  _getHighlights() {
    if (this.state.start == this.state.end) {
      return [];
    }
    else {
      return this.state.visibleText
        .substring(this.state.start, this.state.end)
        .split('\n');
    }
  }

  /**
   * Returns all of the text content that is visible within the current page.
   * Each would-be HTML element is separated by `\n\n`.
   * @return {string}
   */
  _getVisibleText() {
    const {rendition} = this.props.Reader.book;

    // Create ranges for start and end of visible page
    const startRange = rendition.getRange(rendition.location.start.cfi);
    const endRange = rendition.getRange(rendition.location.end.cfi);

    // Create a new range to bring start and end ranges together
    const fullRange = document.createRange();
    if (startRange)
      fullRange.setStart(startRange.startContainer, startRange.startOffset);
    if (endRange)
      fullRange.setEnd(endRange.startContainer, endRange.startOffset);

    // Get the text content of the range
    return fullRange
      .toString()
      .split('\n')
      .map(l => l.trim())
      .filter(l => !!l)
      .join('\n');
  }

  render() {
    const {visibleText, start, end} = this.state;

    const _visibleText = (
      visibleText.substring(0, start) +
        `<span style='background-color: yellow;'>${
          visibleText.substring(start, end)
        }</span>` +
      visibleText.substring(end)
    )
    .replace(/\n/g, '<br /><br />')

    return (
      <div className='highlight'>
        <div
          className='visible-text'
          dangerouslySetInnerHTML={{ __html: _visibleText }}
        />

        <Slider
          id='slider--highlight-start'
          min={0}
          max={visibleText.length}
          label='Highlight Start'
          value={start}
          onChange={v => this.onSlide(v, end, 'start')}
        />

        <Slider
          id='slider--highlight-end'
          min={0}
          max={visibleText.length}
          label='Highlight End'
          value={end}
          onChange={v => this.onSlide(start, v, 'end')}
        />
      </div>
    );
  }

}