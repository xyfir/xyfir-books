import { saveAs } from 'file-saver';
import request from 'superagent';
import React from 'react';
import b from 'based-blob';

// Components
import NavBar from '../misc/NavBar';

// Constants
import { LIBRARY } from 'constants/config';

export default class DownloadLibrary extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = { status: '' };
  }
  
  onDownload() {
    if (!navigator.onLine) {
      swal('Error', 'This action requires internet connectivity', 'error');
      return;
    }
    
    const url = `${LIBRARY}files/${this.props.data.account.library}/`;
    let zip = new JSZip;
    
    const downloadBook = index => {
      const book = this.props.data.books[index];
      
      // All books downloaded
      if (book === undefined) {
        this.setState({ status: 'Downloading library database' });
        
        // Download metadata.db
        request
          .get(url + 'metadata.db')
          .responseType('arraybuffer')
          .end((err, res) => {
            zip.file('metadata.db', res.body, { binary: true });
          
            this.setState({ status: 'Saving zip file' });
            
            const blob = zip.generate({});
            zip = null;

            saveAs(
              b.toBlob(blob, 'application/zip'),
              `Library_${Date.now()}.zip`
            );
              
            this.setState({ status: '' });
          });
      }
      // Download next book
      else {
        let file = book.cover.split('/');
        
        this.setState({
          status: `Downloading book (${
            index + 1}/${this.props.data.books.length
          })`
        });

        // Download cover
        request
          .get(url + file.join('/'))
          .responseType('arraybuffer')
          .then(res => {
            zip.file(file.join('/'), res.body, { binary: true });

            // Download metadata.opf
            file[2] = 'metadata.opf';

            return request
              .get(url + file.join('/'))
              .responseType('arraybuffer')
          })
          .then(res => {
            zip.file(file.join('/'), res.body, { binary: true });

            // Download formats
            book.formats.forEach(format =>
              request
                .get(url + format)
                .responseType('arraybuffer')
                .end((err, res) =>
                  zip.file(format, res.body, { binary: true })
                )
            );

            downloadBook(index + 1);
          })
          .catch(err => 1)
      }
    };
    
    downloadBook(0);
  }

  render() {
    return (
      <div className='library-download'>
        <NavBar
          home={true}
          account={true}
          title='Download Library'
          library={true}
          settings={''}
          books={true}
        />
        
        <section className='info'>
          <p>
            Download your entire library in a zip file. The downloaded library will be completely compatible with <a target='_blank' href='https://calibre-ebook.com/'>Calibre</a>.
          </p>
        </section>

        <section className='download'>                    
          {this.state.status == '' ? (
            <button className='btn-primary' onClick={() => this.onDownload()}>
              Download
            </button>
          ) : (
            <span className='status'>{this.state.status}</span>
          )}
        </section>
      </div>
    );
  }

}