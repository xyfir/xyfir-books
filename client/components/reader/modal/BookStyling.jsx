import { FontIcon, Button } from 'react-md';
import React from 'react';

// Constants
import * as themes from 'constants/reader/themes';
import { FONTS, ALIGNMENTS } from 'constants/reader/styles';

export default class BookStyling extends React.Component {
  constructor(props) {
    super(props);

    this.state = { loading: true };
  }

  componentDidMount() {
    this.props.Reader._getStyles().then(s =>
      this.setState(Object.assign({}, s, { loading: false }))
    );
  }

  /** @param {boolean} next */
  onChangeFont(next) {
    let { fontFamily } = this.state;
    const index = FONTS.indexOf(fontFamily);

    if (next)
      fontFamily = index == FONTS.length - 1 ? FONTS[0] : FONTS[index + 1];
    else fontFamily = index == 0 ? FONTS[FONTS.length - 1] : FONTS[index - 1];

    this._update({ fontFamily });
  }

  /** @param {boolean} next */
  onChangeTextAlign(next) {
    let { textAlign } = this.state;
    const index = ALIGNMENTS.indexOf(textAlign);

    if (next) {
      textAlign =
        index == ALIGNMENTS.length - 1 ? ALIGNMENTS[0] : ALIGNMENTS[index + 1];
    } else {
      textAlign =
        index == 0 ? ALIGNMENTS[ALIGNMENTS.length - 1] : ALIGNMENTS[index - 1];
    }

    this._update({ textAlign });
  }

  /**
   * Increment or decrement a state property.
   * @param {string} prop
   * @param {string} op
   */
  onUpdate(prop, op) {
    let value = +this.state[prop] + (op == '+' ? 0.1 : -0.1);
    value = value < 1 ? 1 : value;

    this._update({ [prop]: value });
  }

  /**
   * Change the reader theme.
   * @param {string} val
   */
  onUpdateTheme(val) {
    this._update(themes[val]);
  }

  /**
   * Update state, update locally saved styles, and apply new styles.
   * @async
   * @param {object} obj
   */
  async _update(obj) {
    const { Reader } = this.props;

    await new Promise(r => this.setState(obj, r));

    const styles = Object.assign({}, this.state);
    delete styles.loading;

    await localforage.setItem(`styling-${Reader.state.book.id}`, styles);
    await Reader._applyStyles();
  }

  render() {
    if (this.state.loading) return null;

    return (
      <section className="book-styling">
        <div>
          <span>
            <FontIcon>format_size</FontIcon>Text Size
          </span>
          <Button
            icon
            primary
            onClick={() => this.onUpdate('fontSize', '+')}
            iconChildren="add"
          />
          <Button
            icon
            secondary
            onClick={() => this.onUpdate('fontSize', '-')}
            iconChildren="remove"
          />
        </div>

        <div>
          <span>
            <FontIcon>format_line_spacing</FontIcon>Line Spacing
          </span>
          <Button
            icon
            primary
            onClick={() => this.onUpdate('lineHeight', '+')}
            iconChildren="add"
          />
          <Button
            icon
            secondary
            onClick={() => this.onUpdate('lineHeight', '-')}
            iconChildren="remove"
          />
        </div>

        <div>
          <span>
            <FontIcon>format_paint</FontIcon>Theme
          </span>
          <Button
            icon
            primary
            onClick={() => this.onUpdateTheme('LIGHT')}
            iconChildren="brightness_7"
          />
          <Button
            icon
            secondary
            onClick={() => this.onUpdateTheme('DARK')}
            iconChildren="brightness_2"
          />
        </div>

        <div>
          <span>
            <FontIcon>font_download</FontIcon>Font ({this.state.fontFamily})
          </span>
          <Button
            icon
            primary
            onClick={() => this.onChangeFont()}
            iconChildren="keyboard_arrow_left"
          />
          <Button
            icon
            secondary
            onClick={() => this.onChangeFont(true)}
            iconChildren="keyboard_arrow_right"
          />
        </div>

        <div>
          <span>
            <FontIcon>format_indent_increase</FontIcon>
            Indentation
          </span>
          <Button
            icon
            primary
            onClick={() => this.onUpdate('textIndent', '+')}
            iconChildren="add"
          />
          <Button
            icon
            secondary
            onClick={() => this.onUpdate('textIndent', '-')}
            iconChildren="remove"
          />
        </div>

        <div>
          <span>
            <FontIcon>format_align_left</FontIcon>
            Alignment ({this.state.textAlign})
          </span>
          <Button
            icon
            primary
            onClick={() => this.onChangeTextAlign()}
            iconChildren="keyboard_arrow_left"
          />
          <Button
            icon
            secondary
            onClick={() => this.onChangeTextAlign(true)}
            iconChildren="keyboard_arrow_right"
          />
        </div>
      </section>
    );
  }
}

BookStyling.noFullscreen = true;
