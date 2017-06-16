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
            this.props.book.annotations[hl.index].set_title;
      }
    })();

    // Notify user of new highlight mode for 5 seconds
    this.setState({ status });
    this.timeout = setTimeout(() => this.setState({ status: '' }), 5000);
  }

  render() {
    let status = '';

    if (this.state.status)
      status = this.state.status;
    else if (this.props.loading)
      status = 'Loading...';
    else {
      status = this.props.percent + '% | ' + (
        !this.props.pagesLeft ?
        'Last page in chapter' :
        this.props.pagesLeft + ' pages left in chapter'
      )
    }
    
    return <span className='status'>{status}</span>
  }

}