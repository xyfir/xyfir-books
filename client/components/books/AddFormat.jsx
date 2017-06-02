import React from 'react';
import Dropzone from 'react-dropzone';

// Action creators
import { addFormat } from 'actions/creators/books';

// Modules
import request from 'lib/request/index';
import upload from 'lib/request/upload';

// Constants
import { LIBRARY } from 'constants/config';

export default class AddFormat extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = {
      id: window.location.hash.split('/')[2],
      converting: false, uploading: false
    };
    
    this.onConvert = this.onConvert.bind(this);
    this.onUpload = this.onUpload.bind(this);
  }
  
  onConvert() {
    if (!navigator.onLine) {
      swal('Error', 'This action requires internet connectivity', 'error');
      return;
    }
    
    this.setState({ converting: true });
    
    const url = LIBRARY + this.props.data.account.library
      + '/books/' + this.state.id
      + '/format/convert?from=' + this.refs.convertFrom.value
      + '&to=' + this.refs.convertTo.value;
      
    request({url, method: 'POST'}, res => {
      this.setState({ converting: false });
      
      if (res.error) {
        swal('Error', 'Could not convert format', 'error');
      }
      else {
        this.props.dispatch(addFormat(
          this.state.id, this.refs.convertTo.value
        ));
        swal('Success', 'Format added', 'success');
      }
    });
  }
  
  onUpload(files) {
    if (!navigator.onLine) {
      swal('Error', 'This action requires internet connectivity', 'error');
      return;
    }
    
    this.setState({ upload: true });
    
    const url = LIBRARY + this.props.data.account.library
      + '/books/' + this.state.id + '/format'; 
    
    upload(url, 'POST', 'book', [files[0]], res => {
      this.setState({ upload: false });
      
      if (res.error) {
        swal('Error', 'Could not upload file', 'error');
      }
      else {
        this.props.dispatch(addFormat(
          this.state.id, files[0].name.split('.').pop()
        ));
        swal('Success', 'Format added', 'success');
      }
    });
  }

  render() {
    const book = this.props.data.books.find(b => this.state.id == b.id);
    const formats = book.formats.map(format => {
      return format.split('.').slice(-1)[0].toUpperCase();
    });
    
    return (
      <div className='add-format old'>
        <p>
          <strong>Note:</strong> Only <a href='https://en.wikipedia.org/wiki/EPUB' target='_blank'>EPUB</a> format ebooks can be read by Xyfir Books' ebook reader.
        </p>
        
        <section className='upload'>
          <h2>Upload</h2>
          <p>
            Add a format a new format for <strong>{book.title}</strong>. If you upload a format that already exists, the old file will be replaced.
          </p>
          <p><strong>Current Available Formats:</strong> {formats.join(', ')}</p>
          
          <hr />
          
          <Dropzone onDrop={this.onUpload} className='dropzone'>{
            this.state.uploading ? (
              'Uploading file, please wait...'
            ) : (
              'Drag and drop ebook file or click box to choose file to upload.'
            )
          }</Dropzone>
        </section>
        
        <section className='convert'>
          <h2>Convert Format</h2>
          <p>
            Our system can attempt to automatically convert an already existing format to a different format. This process is not perfect and can cause formatting and other issues.
            <br />
            The original format will remain untouched.
          </p>
          
          <hr />
          
          <label>Convert From</label>
          <select ref='convertFrom'>{
            formats.map(format =>
              <option value={format.toLowerCase()}>{
                format
              }</option>
            )
          }</select>
          
          <label>Convert To</label>
          <input type='text' ref='convertTo' placeholder='Format' />
          
          <button className='btn-secondary' onClick={this.onConvert}>{
            this.state.converting ? 'Converting...' : 'Convert'
          }</button>
        </section>
      </div>
    );
  }

}