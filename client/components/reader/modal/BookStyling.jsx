import { FontIcon, Button } from 'react-md';
import React from 'react';

// Constants
import * as themes from 'constants/reader-themes';

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

  /**
   * Increment or decrement a state property.
   * @param {string} prop
   * @param {string} op
   */
  onUpdate(prop, op) {
    let value = +this.state[prop] + (op == '+' ? 0.1 : -0.1);
    value = value < 1 ? 1 : value;

    // Set and save styling
    this.setState({ [prop]: value }, () => this._saveStyling());

    prop = prop == 'fontSize' ? 'font-size' : 'line-height';

    this.props.Reader.book.rendition.themes.override(prop, value + 'em');
  }

  /**
   * Change the reader theme.
   * @param {string} val
   */
  onUpdateTheme(val) {
    const style = themes[val];

    this.setState(style, () =>
      this._saveStyling(() =>
        this.props.Reader._applyStyles()
      )
    );
  }

  /**
   * Save the style changes to local storage.
   * @param {function} [fn]
   */
  _saveStyling(fn) {
    localforage.setItem(
      'styling-' + this.props.Reader.state.book.id,
      this.state
    ).then(() => fn ? fn() : 1);
  }

  render() {
    if (this.state.loading) return null;

    return (
      <table className='book-styling'>
      <tbody>
        <tr>
          <th><FontIcon>format_size</FontIcon>Text Size</th>
          <td>
            <Button
              icon primary
              onClick={() => this.onUpdate('fontSize', '+')}
              iconChildren='add'
            />
          </td>
          <td>
            <Button
              icon secondary
              onClick={() => this.onUpdate('fontSize', '-')}
              iconChildren='remove'
            />
          </td>
        </tr>

        <tr>
          <th><FontIcon>format_line_spacing</FontIcon>Line Spacing</th>
          <td>
            <Button
              icon primary
              onClick={() => this.onUpdate('lineHeight', '+')}
              iconChildren='add'
            />
          </td>
          <td>
            <Button
              icon secondary
              onClick={() => this.onUpdate('lineHeight', '-')}
              iconChildren='remove'
            />
          </td>
        </tr>

        <tr>
          <th><FontIcon>format_paint</FontIcon>Theme</th>
          <td>
            <Button
              icon primary
              onClick={() => this.onUpdateTheme('LIGHT')}
              iconChildren='brightness_7'
            />
          </td>
          <td>
            <Button
              icon secondary
              onClick={() => this.onUpdateTheme('DARK')}
              iconChildren='brightness_2'
            />
          </td>
        </tr>
      </tbody>
      </table>
    )
  }

}

BookStyling.noFullscreen = true;