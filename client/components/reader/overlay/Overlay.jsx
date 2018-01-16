import React from 'react';

// Components
import Progress from 'components/reader/overlay/Progress';
import Navbar from 'components/reader/overlay/Navbar';
import Status from 'components/reader/overlay/Status';

export default class ReaderOverlay extends React.Component {

  constructor(props) {
    super(props);

    this.state = { show: false };
  }

  _toggleShow() {
    this.setState({ show: !this.state.show });
  }

  render() {
    const {Reader} = this.props;

    if (!Reader.book || !Reader.book.rendition.location) return null;

    return (
      <div className='overlay'>
        <Navbar
          show={this.state.show}
          Reader={Reader}
        />

        <Status
          ref={i => this._status = i}
          Reader={Reader}
        />

        <Progress
          Reader={Reader}
          show={this.state.show}
        />
      </div>
    );
  }

}