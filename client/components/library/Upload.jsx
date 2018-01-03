import Dropzone from 'react-dropzone';
import request from 'superagent';
import React from 'react';
import swal from 'sweetalert';

// Modules
import loadBooksFromApi from 'lib/books/load-from-api';

// Constants
import { XYLIBRARY_URL } from 'constants/config';

// react-md
import Paper from 'react-md/lib/Papers';

export default class UploadLibrary extends React.Component {

  constructor(props) {
    super(props);

    this.state = { uploading: false };
  }

  onUpload(files) {
    if (!navigator.onLine) {
      swal('Error', 'This action requires internet connectivity', 'error');
      return;
    }

    const acceptedTypes = [
      'application/x-zip-compressed', 'application/zip'
    ];

    if (acceptedTypes.indexOf(files[0].type) == -1) {
      return swal(
        'Invalid File',
        'You can only upload libraries in a zip file',
        'error'
      );
    }

    if (this.state.uploading) return;

    this.setState({ uploading: true })

    request
      .put(`${XYLIBRARY_URL}/libraries/${this.props.data.account.library}`)
      .attach('lib', files[0])
      .end((err, res) => {
        this.setState({ uploading: false })

        if (err || res.body.error) {
          swal('Error', 'Could not upload library', 'error');
        }
        else {
          swal(
            'Success',
            'Library uploaded successfully. Reloading library...',
            'success'
          );

          loadBooksFromApi(
            this.props.data.account.library,
            this.props.dispatch
          );
        }
      });
  }

  render() {
    return (
      <Paper
        zDepth={1}
        component='section'
        className='upload-library section'
      >
        <p>
          Here you can upload an entire ebook library instead of individual ebook files.
          <br />
          Only <a target='_blank' href='https://calibre-ebook.com/'>Calibre</a>-compatible libraries are accepted.
          <br />
          The library must be zipped at the library's root folder. This means when you look inside the zip file you should see folders for all of the authors in your library and then your library's <em>metadata.db</em> database file.
          <br />
          Library zip file size is limited to 500 MB.
          <br />
          If you already have books in your library stored in the cloud they <strong>will</strong> be deleted. Uploading a library completely erases your old one.
        </p>

        <Dropzone onDrop={f => this.onUpload(f)} className='dropzone'>{
          this.state.uploading
            ? 'Uploading library, this may take a while...'
            : 'Drag and drop zip file or click to choose a file to upload.'
        }</Dropzone>
      </Paper>
    );
  }

}