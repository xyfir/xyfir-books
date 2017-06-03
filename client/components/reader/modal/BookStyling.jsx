import React from 'react';

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

  onUpdate(prop, op) {
    let value = +this.state[prop] + (op == '+' ? 0.1 : -0.1);
    value = value < 1 ? 1 : value;

    // Set and save styling
    this.setState({ [prop]: value }, () => this._saveStyling());
    
    epub.setStyle(
      prop, prop == 'padding' ? (`0em ${value}em`) : (value + 'em')
    );
  }

  onUpdateTheme(val) {
    const style = themes[val];

    this.setState(style, () => this._saveStyling(() => {
      this.props.reader._applyStyles();
      epub.setStyle('backgroundColor', style.backgroundColor);
    }));
  }

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
              <button
                className='btn-secondary icon-plus'
                onClick={() =>
                  this.onUpdate('fontSize', '+')
                }
              />
              <button
                className='btn-secondary icon-minus'
                onClick={() =>
                  this.onUpdate('fontSize', '-')
                }
              />
            </td>
          </tr>

          <tr>
            <th>Page Padding</th>
            <td>
              <button
                className='btn-secondary icon-plus'
                onClick={() =>
                  this.onUpdate('padding', '+')
                }
              />
              <button
                className='btn-secondary icon-minus'
                onClick={() =>
                  this.onUpdate('padding', '-')
                }
              />
            </td>
          </tr>

          <tr>
            <th>Line Spacing</th>
            <td>
              <button
                className='btn-secondary icon-plus'
                onClick={() =>
                  this.onUpdate('lineHeight', '+')
                }
              />
              <button
                className='btn-secondary icon-minus'
                onClick={() =>
                  this.onUpdate('lineHeight', '-')
                }
              />
            </td>
          </tr>

          <tr>
            <th>Theme</th>
            <td>
              <button
                className='btn-secondary'
                onClick={() => this.onUpdateTheme('LIGHT')}
              >Light</button>
              <button
                className='btn-secondary'
                onClick={() => this.onUpdateTheme('DARK')}
              >Dark</button>
            </td>
          </tr>
        </tbody></table>
      </div>
    )
  }

}