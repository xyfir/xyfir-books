import React from 'react';

// react-md
import Button from 'react-md/lib/Buttons/Button';

// Constants
import * as themes from 'constants/reader-themes';

export default class BookStyling extends React.Component {

  constructor(props) {
    super(props);

    this.state = { loading: true };

    this.props.reader._getStyles()
      .then(s =>
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
    
    epub.setStyle(
      prop, prop == 'padding' ? (`0em ${value}em`) : (value + 'em')
    );
  }

  /**
   * Change the reader theme.
   * @param {string} val
   */
  onUpdateTheme(val) {
    const style = themes[val];

    this.setState(style, () => this._saveStyling(() => {
      this.props.reader._applyStyles();
      epub.setStyle('backgroundColor', style.backgroundColor);
    }));
  }

  /**
   * Save the style changes to local storage.
   * @param {function} [fn]
   */
  _saveStyling(fn) {
    localforage.setItem(
      'styling-' + this.props.reader.state.book.id,
      this.state
    ).then(() => fn ? fn() : 1);
  }

  render() {
    if (this.state.loading) return <div />

    return (
      <div className='book-styling'>
        <table><tbody>
          <tr>
            <th>Text Size</th>
            <td>
              <Button
                flat primary
                onClick={() => this.onUpdate('fontSize', '+')}
              >add</Button>
              <Button
                flat secondary
                onClick={() => this.onUpdate('fontSize', '-')}
              >remove</Button>
            </td>
          </tr>

          <tr>
            <th>Page Padding</th>
            <td>
              <Button
                flat primary
                onClick={() => this.onUpdate('padding', '+')}
              >add</Button>
              <Button
                flat secondary
                onClick={() => this.onUpdate('padding', '-')}
              >remove</Button>
            </td>
          </tr>

          <tr>
            <th>Line Spacing</th>
            <td>
              <Button
                flat primary
                onClick={() => this.onUpdate('lineHeight', '+')}
              >add</Button>
              <Button
                flat secondary
                onClick={() => this.onUpdate('lineHeight', '-')}
              >remove</Button>
            </td>
          </tr>

          <tr>
            <th>Theme</th>
            <td>
              <Button
                flat primary
                label='Light'
                onClick={() => this.onUpdateTheme('LIGHT')}
              >brightness_7</Button>
              <Button
                flat secondary
                label='Dark'
                onClick={() => this.onUpdateTheme('DARK')}
              >brightness_2</Button>
            </td>
          </tr>
        </tbody></table>
      </div>
    )
  }

}

BookStyling.noFullscreen = true;