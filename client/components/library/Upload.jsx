import Dropzone from 'react-dropzone';
import request from 'superagent';
import React from 'react';
import swal from 'sweetalert';

// Modules
import loadBooksFromApi from 'lib/books/load-from-api';

// Constants
import { XYLIBRARY_URL } from 'constants/config';

// Components
import OpenWindow from 'components/misc/OpenWindow';

export default class UploadLibrary extends React.Component {

  constructor(props) {
    super(props);

    this.state = { uploading: false },
    this.acceptedTypes = [
      'application/x-zip-compressed',
      'application/zip'
    ];
  }

  /** @param {File[]} files */
  onUpload(files) {
    const {App} = this.props;

    if (this.state.uploading)
      return;
    if (!navigator.onLine)
      return App._alert('This action requires internet connectivity');
    if (this.acceptedTypes.indexOf(files[0].type) == -1)
      return App._alert('You can only upload libraries in a zip file');

    this.setState({ uploading: true })

    request
      .put(`${XYLIBRARY_URL}/libraries/${App.state.account.library}`)
      .attach('lib', files[0])
      .end((err, res) => {
        this.setState({ uploading: false })

        if (err || res.body.error)
          return App._alert('Could not upload library');

        App._alert('Library uploaded successfully. Reloading library...');

        loadBooksFromApi(App.state.account.library, App.store.dispatch);
      });
  }

  render() {
    return (
      <Dropzone
        onDrop={f => this.onUpload(f)}
        disabled={this.state.uploading}
        className='dropzone upload-library'
      >
        <p className='status'>{
          this.state.uploading
            ? 'Uploading library, this may take a while...'
            : 'Drag and drop zip file or click to choose a file to upload.'
        }</p>

        <p>
          Here you can upload an entire ebook library instead of individual ebook files.
        </p>
        <p>
          Only <OpenWindow href='https://calibre-ebook.com/'>Calibre</OpenWindow>-compatible libraries are accepted.
        </p>
        <p>
          The library must be zipped at the library's root folder. This means when you look inside the zip file you should see folders for all of the authors in your library and then your library's <em>metadata.db</em> database file.
        </p>
        <p>
          Library zip file size is limited to 500 MB.
        </p>
        <p>
          If you already have books in your library stored in the cloud they <strong>will</strong> be deleted. Uploading a library completely erases your old one.
        </p>
      </Dropzone>
    );
  }

}