import { Paper, Button, TextField, SelectField } from 'react-md';
import Dropzone from 'react-dropzone';
import request from 'superagent';
import React from 'react';
import swal from 'sweetalert';

// Action creators
import { addFormat } from 'actions/creators/books';

// Constants
import { LIBRARY } from 'constants/config';

export default class AddFormat extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = {
      id: window.location.hash.split('/')[3],
      converting: false, uploading: false
    };
  }

  onConvert() {
    if (!navigator.onLine)
      return swal('Error', 'Internet connectivity required', 'error');

    this.setState({ converting: true });

    request
      .post(
        `${LIBRARY}libraries/${this.props.data.account.library}` +
        `/books/${this.state.id}/format/convert`
      )
      .query({
        from: this._convertFrom.value,
        to: this._convertTo.value
      })
      .end((err, res) => {
        this.setState({ converting: false });
        
        if (err || res.body.error)
          return swal('Error', 'Could not convert format', 'error');

        this.props.dispatch(
          addFormat(this.state.id, this._convertTo.value)
        );
        swal('Success', 'Format added', 'success');
      });
  }
  
  onUpload(files) {
    if (!navigator.onLine)
      return swal('Error', 'Internet connectivity required', 'error');

    this.setState({ upload: true });

    request
      .post(
        `${LIBRARY}libraries/${this.props.data.account.library}` +
        `/books/${this.state.id}/format`
      )
      .attach('book', files[0])
      .end((err, res) => {
        this.setState({ upload: false });
        
        if (err || res.body.error) {
          console.log('err', err, 'res', res.body);
          return swal('Error', 'Could not upload file', 'error');
        }

        this.props.dispatch(
          addFormat(this.state.id, files[0].name.split('.').pop())
        );
        swal('Success', 'Format added', 'success');
      });
  }

  render() {
    const book = this.props.data.books.find(b => this.state.id == b.id);
    const formats = book.formats.map(format =>
      format.split('.').slice(-1)[0].toUpperCase()
    );
    
    return (
      <div className='add-format'>
        <p>
          <strong>Note:</strong> Only <a href='https://en.wikipedia.org/wiki/EPUB' target='_blank'>EPUB</a> format ebooks can be read directly in the xyBooks ebook reader.
        </p>
        
        <Paper
          zDepth={1}
          component='section'
          className='upload section flex'
        >
          <h2>Upload</h2>
          <p>
            Add a new format for <strong>{book.title}</strong>. If you upload a format that already exists, the old file will be replaced.
          </p>
          <p><strong>Current Available Formats:</strong> {formats.join(', ')}</p>

          <Dropzone onDrop={f => this.onUpload(f)} className='dropzone'>{
            this.state.uploading
              ? 'Uploading file, please wait...'
              : 'Drag and drop ebook or click box to choose a file to upload.'
          }</Dropzone>
        </Paper>
        
        <Paper
          zDepth={1}
          component='section'
          className='convert section flex'
        >
          <h2>Convert Format</h2>
          <p>
            Our system can attempt to automatically convert an already existing format to a different format. This process is not perfect and may cause issues within the new format.
          </p>
          <p>The original format will remain untouched.</p>

          <SelectField
            id='select--convert-from'
            ref={i => this._convertFrom = i}
            label='Convert From'
            menuItems={
              formats.map(format =>
                Object({ label: format, value: format.toLowerCase() })
              )
            }
            className='md-cell'
          />

          <TextField
            id='text--convert-to'
            ref={i => this._convertTo = i}
            type='text'
            label='Convert to Format'
            className='md-cell'
          />
          
          <Button
            raised primary
            onClick={() => this.onConvert()}
          >{this.state.converting ? 'Converting...' : 'Convert'}</Button>
        </Paper>
      </div>
    );
  }

}