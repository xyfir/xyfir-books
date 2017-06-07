import Dropzone from 'react-dropzone';
import request from 'superagent';
import React from 'react';

// react-md
import Paper from 'react-md/lib/Papers';

// Modules
import loadBooksFromApi from 'lib/books/load-from-api';

// Constants
import { LIBRARY } from 'constants/config';

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
      const req = request
        .post(LIBRARY + this.props.data.account.library + '/books');
      
      files.forEach(file => req.attach('book', file));

      req.end((err, res) => {
        this.setState({ uploading: false });
      
        if (err || res.body.error) {
          this.props.alert('Could not upload file(s)');
        }
        else {
          this.props.alert('Book(s) uploaded successfully');
          
          // Reload state.books from API
          loadBooksFromApi(
            this.props.data.account.library, this.props.dispatch
          );
        }
      });
    }
    catch (err) {
      this.props.alert(err.toString());
      this.setState({ uploading: false });
    }
  }

  render() {
    return (
      <Paper zDepth={1} className='upload-books section'>
        <p>
          Upload ebooks to add to your library. Our system will automatically attempt to extract metadata (title, authors, ...) from the ebook files. Each book's metadata can be viewed and modified after upload.
        </p>
        <p>
          While only EPUB format ebooks can be read by the xyBooks ebook reader, any format can be uploaded and managed.
        </p>
        <p>
          You can also upload books by sending an email to <code>upload-books@xyfir.com</code> with ebook files attached. Books will only be uploaded to your account if the email is sent from the email address that is linked to your xyBooks account.
        </p>
        
        <Dropzone onDrop={f => this.onUpload(f)} className='dropzone'>{
          this.state.uploading
          ? 'Uploading file(s), please wait...'
          : 'Drag and drop ebook files or click box to choose files to upload'
        }</Dropzone>
      </Paper>
    );
  }

}