import React from 'react';

export default class ReaderStatus extends React.Component {

  constructor(props) {
    super(props);

    this.state = { status: '' };
  }

  _setStatus(hl) {
    clearTimeout(this.timeout);

    const status = (() => {
      switch (hl.mode) {
        case 'none':
          return 'Highlights turned off';
        
        case 'notes':
          return 'Now highlighting notes';

        case 'annotations':
          return 'Now highlighting annotations from set ' +
            this.props.Reader.state.book.annotations[hl.index].set_title;
      }
    })();

    // Notify user of new highlight mode for 5 seconds
    this.setState({ status });
    this.timeout = setTimeout(() => this.setState({ status: '' }), 5000);
  }

  render() {
    const {loading, percent, pagesLeft} = this.props.Reader.state;
    let status = '';

    if (this.state.status)
      status = this.state.status;
    else if (loading)
      status = 'Loading...';
    else {
      status = percent + '% | ' + (
        !pagesLeft
          ? 'Last page in chapter'
          : pagesLeft + ' pages left in chapter'
      )
    }
    
    return <span className='status'>{status}</span>
  }

}