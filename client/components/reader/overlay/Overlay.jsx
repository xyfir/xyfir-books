import React from 'react';

// Components
import Progress from 'components/reader/overlay/Progress';
import Navbar from 'components/reader/overlay/Navbar';
import Status from 'components/reader/overlay/Status';

export default class ReaderOverlay extends React.Component {

  constructor(props) {
    super(props);

    this.state = { show: true };
  }

  componentDidMount() {
    setTimeout(() => this.setState({ show: false }), 3500);
  }
  
  _toggleShow() {
    this.setState({ show: !this.state.show });
  }

  render() {
    const p = this.props.parent;

    return (
      <div className='overlay'>
        <Navbar
          book={p.state.book}
          show={this.state.show}
          reader={p}
          updateBook={p._updateBook}
          onToggleShow={p.onToggleShow}
        />

        <Status
          ref='status'
          book={p.state.book}
          loading={p.state.loading}
          percent={p.state.percent}
          pagesLeft={p.state.pagesLeft}
        />

        <Progress
          reader={p}
          show={this.state.show}
        />
      </div>
    );
  }

}