import React from 'react';

// react-md
import TextField from 'react-md/lib/TextFields';
import Button from 'react-md/lib/Buttons/Button';
import Dialog from 'react-md/lib/Dialogs';
import Slider from 'react-md/lib/Sliders';

export default class ColorPicker extends React.Component {
  constructor(props) {
    super(props);

    this.state = { visible: false, r: 10, g: 188, b: 212 };
  }

  onChange(r = this.state.r, g = this.state.g, b = this.state.b) {
    this.setState({ r, g, b });

    this.props.onChange &&
    this.props.onChange(this._rgbToHex(r, g, b));
  }

  _rgbToHex(r, g, b) {
    return '#' + this._toHex(r) + this._toHex(g) + this._toHex(b);
  }
  
  _toHex(n) {
    n = parseInt(n, 10);
    
    if (isNaN(n)) return '00';

    n = Math.max(0, Math.min(n, 255));

    const chars = '0123456789ABCDEF';

    return chars.charAt((n - n % 16) / 16) + chars.charAt(n % 16);
  }

  get value() {
    const { r, g, b } = this.state;
    return _rgbToHex(r, g, b);
  }

  render() {
    const { r, g, b, visible } = this.state;

    return (
      <div className='color-picker'>
        <TextField
          id={'color--' + this.props.id}
          type='text'
          label={this.props.label}
          value={this.props.value}
          onChange={v => this.props.onChange(v)}
          className='md-cell'
        />
        <Button
          icon
          onClick={() => this.setState({ visible: true })}
        >colorize</Button>

        <Dialog
          id='color-picker'
          onHide={() => this.setState({ visible: false })}
          visible={visible}
          aria-label='Color Picker'
          dialogClassName='color-picker-dialog'
        >
          <header
            className='color'
            style={{ background: `rgb(${r}, ${g}, ${b})` }}
          />

          <Slider
            leftIcon={<span className='md-slider-ind'>R</span>}
            onChange={r => this.onChange(r)}
            value={r}
            max={255}
          />
          <Slider
            leftIcon={<span className='md-slider-ind'>G</span>}
            onChange={g => this.onChange(undefined, g)}
            value={g}
            max={255}
          />
          <Slider
            leftIcon={<span className='md-slider-ind'>B</span>}
            onChange={b => this.onChange(undefined, undefined, b)}
            value={b}
            max={255}
          />
        </Dialog>
      </div>
    );
  }
}