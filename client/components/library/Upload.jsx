import React from 'react';
import Dropzone from 'react-dropzone';

// Modules
import loadBooksFromApi from 'lib/books/load-from-api';
import upload from 'lib/request/upload';

// Constants
import { LIBRARY } from 'constants/config';

export default class UploadLibrary extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = { uploading: false };
    
    this.onUpload = this.onUpload.bind(this);
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
      swal(
        'Invalid File',
        'You can only upload libraries in a zip file',
        'error'
      ); return;
    }
    
    if (this.state.uploading)
      return;
    else
      this.setState({ uploading: true })
    
    const url = LIBRARY + this.props.data.account.library + '/upload'; 
    
    upload(url, 'POST', 'lib', [files[0]], res => {
      this.setState({ uploading: false })
      
      if (res.error) {
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
      <div className='library-upload old'>
        <section className='info'>
          <p>
            Here you can upload an entire ebook library instead of individual ebook files.
            <br />
            Only <a target='_blank' href='https://calibre-ebook.com/'>Calibre</a> libraries are accepted.
            <br /> 
            The library must be zipped at the library's root folder. This means when you look inside the zip file you should see folders for all of the authors in your library and then your library's <em>metadata.db</em> database file.
            <br />
            Library zip file size is limited to 500 MB.
            <br />
            If you already have books in your library stored in the cloud they <strong>will</strong> be deleted. Uploading a library completely erases your old one.
          </p>
        </section>
          
        <section className='upload'>
          <Dropzone onDrop={this.onUpload} className='dropzone'>{
            this.state.uploading ? (
              'Uploading library, this may take a while...'
            ) : (
              'Drag and drop library zip file or click box to choose file to upload.'
            )
          }</Dropzone>
        </section>
      </div>
    );
  }

}