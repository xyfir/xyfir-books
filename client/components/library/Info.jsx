import request from 'superagent';
import React from 'react';

// Constants
import { LIBRARY } from 'constants/config';

// react-md
import Button from 'react-md/lib/Buttons/Button';
import Paper from 'react-md/lib/Papers';

export default class LibraryInfo extends React.Component {

  constructor(props) {
    super(props);
      
    this.state = { size: 0 };
    
    request
      .get(`${LIBRARY}libraries/${this.props.data.account.library}`)
      .end((err, res) => {
        if (err || res.body.error)
          this.setState({ size: -1 });
        else
          this.setState({ size: res.body.size });
      });
  }

  onDownload() {
    request
      .post(`${LIBRARY}libraries/${this.props.data.account.library}/zip`)
      .send({
        email: this.props.data.account.email
      })
      .end((err, res) => {
        if (err || res.body.error)
          return swal('Error', 'Something went wrong...', 'error');

        swal(
          'Processing...',
          'A download link will be sent to your email once it\'s ready. \
          The download link will be available for 24 hours after being sent.'
        );
      });
  }

  render() {
    return (
      <Paper
        zDepth={1}
        component='section'
        className='library-info section flex'
      > 
        <table>
          <tr>
            <th>Id</th>
            <td>{this.props.data.account.library}</td>
          </tr>
          <tr>
            <th>Size</th>
            <td>{
              this.state.size == -1
                ? 'Could not calculate size'
                : (this.state.size * 0.000001) + 'MB'
            }</td>
          </tr>
        </table>

        <Button
          floating fixed primary
          tooltipPosition='right'
          tooltipLabel='Upload new library'
          fixedPosition='bl'
          onClick={() => location.hash = '#library/upload'}
        >cloud_upload</Button>

        <Button
          floating fixed primary
          tooltipPosition='left'
          tooltipLabel='Download library'
          fixedPosition='br'
          onClick={() => this.onDownload()}
        >cloud_download</Button>
      </Paper>
    );
  }

}