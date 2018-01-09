import { Button } from 'react-md';
import React from 'react';

// Modules
import openWindow from 'lib/util/open-window';

export default class OpenWindow extends React.Component {

  constructor(props) {
    super(props);
  }

  onClick(e) {
    e.preventDefault();
    openWindow(this.props.href);
  }

  render() {
    return (
      <a
        className='open-window'
        onClick={e => this.onClick(e)}
        href={this.props.href}
      >{this.props.children}</a>
    );
  }

}