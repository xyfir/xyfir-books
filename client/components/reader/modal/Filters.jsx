import { Slider, FontIcon } from 'react-md';
import React from 'react';

export default class Filters extends React.Component {

  constructor(props) {
    super(props);

    this.state = { loading: true };

    this.props.Reader._getFilters().then(f =>
      this.setState(Object.assign({}, f, { loading: false }))
    );
  }

  onUpdate(prop, val) {
    clearTimeout(this.timeout);

    this.timeout = setTimeout(() => {
      const filters = Object.assign({}, this.state);

      filters[prop] = val;

      this.props.Reader._applyFilters(filters);
      this.setState(filters);
    }, 100);
  }

  componentWillUnmount() {
    localforage.setItem(
      'filters-' + this.props.Reader.state.book.id,
      this.state
    );
  }

  render() {
    if (this.state.loading) return null;

    return (
      <div className='filters'>
        <Slider
          id='slider--brightness'
          min={50}
          max={100}
          label='Brightness'
          leftIcon={<FontIcon>brightness_medium</FontIcon>}
          onChange={v => this.onUpdate('brightness', v)}
          defaultValue={this.state.brightness}
        />

        <Slider
          id='slider--warmth'
          min={0}
          max={50}
          label='Warmth'
          leftIcon={<FontIcon>wb_sunny</FontIcon>}
          onChange={v => this.onUpdate('warmth', v)}
          defaultValue={this.state.warmth}
        />

        <Slider
          id='slider--contrast'
          min={50}
          max={150}
          label='Contrast'
          leftIcon={<FontIcon>tonality</FontIcon>}
          onChange={v => this.onUpdate('contrast', v)}
          defaultValue={this.state.contrast}
        />
      </div>
    )
  }

}

Filters.noFullscreen = true;