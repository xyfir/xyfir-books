import request from 'superagent';
import React from 'react';
import swal from 'sweetalert';

// Constants
import { XYLIBRARY_URL } from 'constants/config';

// react-md
import Button from 'react-md/lib/Buttons/Button';
import Paper from 'react-md/lib/Papers';

export default class LibraryInfo extends React.Component {

  constructor(props) {
    super(props);

    this.state = { size: 0 };

    request
      .get(`${XYLIBRARY_URL}/libraries/${this.props.data.account.library}`)
      .end((err, res) => {
        if (err || res.body.error)
          this.setState({ size: -1 });
        else
          this.setState({ size: res.body.size });
      });
  }

  onDownload() {
    swal({
      title: 'Download Library',
      text:
        'An email containing a download link to your entire library will ' +
        'be sent once its ready.',
      icon: 'warning',
      buttons: true
    })
    .then(() => request
      .post(
        `${XYLIBRARY_URL}/libraries/${this.props.data.account.library}/zip`
      )
      .send({
        email: this.props.data.account.email
      })
    )
    .then(res => {
      if (res.body.error)
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
          iconChildren='cloud_upload'
          onClick={() => location.hash = '#/library/upload'}
        />

        <Button
          floating fixed primary
          tooltipPosition='left'
          tooltipLabel='Download library'
          fixedPosition='br'
          iconChildren='cloud_download'
          onClick={() => this.onDownload()}
        />
      </Paper>
    );
  }

}