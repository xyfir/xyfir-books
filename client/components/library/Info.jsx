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
      .get(`${XYLIBRARY_URL}/libraries/${props.App.state.account.library}`)
      .end((err, res) => {
        if (err || res.body.error)
          this.setState({ size: -1 });
        else
          this.setState({ size: res.body.size });
      });
  }

  onDownload() {
    const {App} = this.props;

    swal({
      title: 'Download Library',
      text:
        'An email containing a download link to your entire library will ' +
        'be sent once its ready.',
      icon: 'warning',
      buttons: true
    })
    .then(confirm => confirm && request
      .post(
        `${XYLIBRARY_URL}/libraries/${App.state.account.library}/zip`
      )
      .send({
        email: App.state.account.email
      })
    )
    .then(res => {
      if (!res)
        return;
      else if (res.body.error)
        App._alert('Something went wrong...');
      else
        App._alert('A download link will be sent to your email once ready.');
    });
  }

  render() {
    const {App} = this.props;

    return (
      <section className='library-info'>
        <Paper
          zDepth={1}
          component='table'
          className='library-info section flex'
        >
        <tbody>
          <tr>
            <th>Identifier</th>
            <td>
              <input
                type='text'
                value={App.state.account.library}
                onFocus={e => e.target.select()}
              />
            </td>
          </tr>
          <tr>
            <th>Books</th>
            <td>{App.state.books.length}</td>
          </tr>
          <tr>
            <th>Size</th>
            <td>{
              this.state.size == -1
                ? `Could not calculate size`
                : `${(this.state.size * 0.000001).toFixed(2)} MB`
            }</td>
          </tr>
        </tbody>
        </Paper>

        <Button
          raised primary
          iconChildren='cloud_upload'
          onClick={() => location.hash = '#/library/upload'}
        >Upload</Button>

        <Button
          raised primary
          iconChildren='cloud_download'
          onClick={() => this.onDownload()}
        >Download</Button>
      </section>
    );
  }

}