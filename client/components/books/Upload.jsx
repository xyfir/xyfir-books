import Dropzone from 'react-dropzone';
import request from 'superagent';
import React from 'react';

// Modules
import loadBooksFromApi from 'lib/books/load-from-api';

// Constants
import { XYLIBRARY_URL } from 'constants/config';

export default class UploadBooks extends React.Component {

  constructor(props) {
    super(props);

    this.state = { uploading: false };
  }

  /**
   * Validate and attempt to upload books.
   * @param {File[]} files
   */
  onUpload(files) {
    const {App} = this.props;

    try {
      if (!navigator.onLine)
        throw 'This action requires internet connectivity';

      if (this.state.uploading)
        return;
      else
        this.setState({ uploading: true });

      // Determine space needed on storage server
      const bytes = files.reduce((a, f) => a + f.size);

      if (bytes > 500000001 || files.length > 20)
        throw 'Limit 20 files and 500mb total';

      // Upload files
      const req = request.post(
        `${XYLIBRARY_URL}/libraries/${App.state.account.library}/books`
      );

      files.forEach(file => req.attach('book', file));

      req.end((err, res) => {
        this.setState({ uploading: false });

        if (err || res.body.error) {
          console.error('<UploadBooks>', err, '-', res);
          return App._alert('Could not upload file(s)');
        }

        App._alert('Book(s) uploaded successfully');

        // Reload state.books from API
        loadBooksFromApi(App.state.account.library, App.store.dispatch);
      });
    }
    catch (err) {
      App._alert(err.toString());
      this.setState({ uploading: false });
    }
  }

  render() {
    return (
      <Dropzone
        onDrop={f => this.onUpload(f)}
        disabled={this.state.uploading}
        className='dropzone upload-books'
      >
        <p className='status'>{
          this.state.uploading
            ? 'Uploading file(s), please wait...'
            : 'Drag and drop ebooks or click box to choose files to upload'
        }</p>

        <p>
          Upload ebooks to your library. Metadata (title, authors, etc) will automatically be extracted from the ebook files. Each book's metadata can be viewed and modified after upload.
        </p>
        <p>
          Any format can be uploaded and managed. Only EPUB can be read.
        </p>
        <p>
          You can also upload books by sending emails to <a href='mailto:upload-books@xyfir.com'>upload-books@xyfir.com</a> with ebook files attached. Books will only be uploaded to your account if the email is sent from the email address that is linked to your xyBooks account. You may upload up to 25MB worth of ebooks per email.
        </p>
      </Dropzone>
    );
  }

}