import React from 'react';

// react-md
import Slider from 'react-md/lib/Sliders';

export default class Filters extends React.Component {

  constructor(props) {
    super(props);

    this.state = { loading: true };

    this.props.reader._getFilters(f =>
      this.setState(Object.assign({}, f, { loading: false }))
    );
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
      'filters-' + this.props.reader.state.book.id,
      this.state
    );
  }

  render() {
    if (this.state.loading) return <div />
    
    return (
      <div className='filters'>
        <Slider
          id='slider--brightness'
          min={50}
          max={100}
          label='Brightness'
          leftIcon={<i className='icon-light-up' />}
          onChange={v => this.onUpdate('brightness', v)}
          defaultValue={this.state.brightness}
        />

        <Slider
          id='slider--warmth'
          min={0}
          max={100}
          label='Warmth'
          leftIcon={<i className='icon-fire' />}
          onChange={v => this.onUpdate('warmth', v)}
          defaultValue={this.state.warmth}
        />

        <Slider
          id='slider--contrast'
          min={50}
          max={150}
          label='Contrast'
          leftIcon={<icon className='icon-contrast' />}
          onChange={v => this.onUpdate('contrast', v)}
          defaultValue={this.state.contrast}
        />
      </div>
    )
  }

}