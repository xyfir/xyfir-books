import Dropzone from 'react-dropzone';
import request from 'superagent';
import moment from 'moment';
import React from 'react';
import swal from 'sweetalert';

// Modules
import loadCovers from 'lib/books/load-covers';
import loadBooks from 'lib/books/load-from-api';
import buildUrl from 'lib/url/build';

// Constants
import { LIBRARY } from 'constants/config';

// Action creators
import { deleteFormat, incrementVersion } from 'actions/creators/books';

// react-md
import DatePicker from 'react-md/lib/Pickers/DatePickerContainer';
import TextField from 'react-md/lib/TextFields';
import Button from 'react-md/lib/Buttons/Button';
import Dialog from 'react-md/lib/Dialogs';
import Paper from 'react-md/lib/Papers';

export default class ManageBook extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = {
      id: window.location.hash.split('/')[2],
      downloadingMetadata: false,
      editComments: false,
      findCover: false,
      saving: false
    };
  }
  
  componentDidMount() {
    loadCovers(this.props.data.books, this.props.data.account.library);
  }
  
  onDownloadMetadata() {
    if (!navigator.onLine) {
      swal('Error', 'This action requires internet connectivity', 'error');
      return;
    }
    
    this.setState({ downloadingMetadata: true });
    
    let search;
    
    // Get metadata using ISBN
    this.refs.identifiers.value
      .split(', ')
      .forEach(id => {
        const t = id.split(':');
        
        if (t[0] == 'isbn') search = 'isbn=' + t[1];
      });
    
    // Get metadata using author/title
    if (!search) {
      search =
        'author=' + encodeURIComponent(this.refs.authors.value) +
        '&title=' + encodeURIComponent(this.refs.title.value);
    }

    request
      .get(
        `${LIBRARY}libraries/${this.props.data.account.library}` +
        `/books/${this.state.id}/metadata`
      )
      .query(search)
      .end((err, res) => {
        if (res.text == '1') {
          this.setState({ downloadingMetadata: false });
          return swal('Error', 'Could not find metadata', 'error');
        }
        
        res.text = res.text.split('\n');
        
        res.text.forEach((kv, i) => {
          kv = kv.split('   : ');
          kv[1] = kv[1].trim();
            
          switch (kv[0].trim()) {
            case 'Title':
              return this.refs.title.value = kv[1];
            case 'Author(s)':
              return this.refs.authors.value = kv[1];
            case 'Publisher':
              return this.refs.publisher.value = kv[1];
            case 'Tags':
              return this.refs.tags.value = kv[1];
            case 'Published':
              return this.refs.pubdate._setCalendarTempDate(new Date(kv[1]));
            case 'Identifiers':
              return this.refs.identifiers.value = kv[1];
            case 'Comments':
              // Comments can have newlines and comments is always last field
              const comments = [kv[1]]
                .concat(res.text.splice(i + 1))
                .join(' ');
              if (this.state.editComments)
                this.refs.comments.value = comments;
              else
                this.refs.comments.innerHTML = comments;
          }
        });
        
        this.setState({ downloadingMetadata: false });
      });
  }
  
  onDeleteFormat(f) {
    if (!navigator.onLine) {
      swal('Error', 'This action requires internet connectivity', 'error');
      return;
    }

    request
      .delete(
        `${LIBRARY}libraries/${this.props.data.account.library}` +
        `/books/${this.state.id}/format/${f}`
      )
      .end((err, res) => {
        if (err || res.body.error)
          swal('Error', 'Could not delete format', 'error');
        else
          this.props.dispatch(deleteFormat(this.state.id, f));
      });
  }
  
  onUploadCover(files) {
    if (!navigator.onLine) {
      swal('Error', 'This action requires internet connectivity', 'error');
      return;
    } 

    request
      .put(
        `${LIBRARY}libraries/${this.props.data.account.library}` +
        `/books/${this.state.id}/cover`
      )
      .attach('cover', files[0])
      .end((err, res) => {
        if (res.error)
          return swal('Error', 'Could not upload file', 'error');

        const lfKey =
          `cover-${this.state.id}-` +
          this.props.data.books.find(b => this.state.id == b.id).versions.cover;
        
        localforage.setItem(lfKey, files[0])
          .then(img => {
            // Load new cover
            document.querySelector('img.cover').src = files[0].preview;
            
            // Increment book.versions.cover
            this.props.dispatch(incrementVersion(this.state.id, 'cover'));
          })
          .catch(err => location.reload());
      });
  }
  
  onSaveChanges() {
    if (!navigator.onLine) {
      swal('Error', 'This action requires internet connectivity', 'error');
      return;
    }
    
    this.setState({ saving: true });

    const { refs } = this;
    
    const data = {
      identifiers: refs.identifiers.value,
      author_sort: refs.author_sort.value,
      publisher: refs.publisher.value,
      timestamp: moment(refs.timestamp.state.calendarTempDate).toISOString(),
      authors: refs.authors.value,
      pubdate: moment(refs.pubdate.state.calendarTempDate).toISOString(),
      rating: refs.rating.value,
      title: refs.title.value,
      tags: refs.tags.value
    };
    
    // Calibre doubles rating for some reason...
    data.rating = data.rating > 0 ? data.rating / 2 : data.rating;
    
    if (refs.series.value != '') {
      data.series = refs.series.value;
      data.series_index = refs.series_index.value;
    }

    if (refs.comments.getField)
      data.comments = refs.comments.value;
    else
      data.comments = refs.comments.innerHTML;

    // Send to xyLibrary
    request
      .put(
        `${LIBRARY}libraries/${this.props.data.account.library}` +
        `/books/${this.state.id}/metadata`
      )
      .send({
        data: JSON.stringify(data)
      })
      .end((err, res) => {
        this.setState({ saving: false });
      
        if (err || res.body.error)
          return swal('Error', 'An unknown error occured', 'error');

        // Reload state.books and update local storage books
        loadBooks(
          this.props.data.account.library,
          this.props.dispatch
        );
      });
  }

  render() {
    const book = this.props.data.books.find(b => this.state.id == b.id);
    
    return (
      <div className='manage-book'>
        <Paper
          zDepth={1}
          component='section'
          className='main section flex'
        >
          <TextField
            id='text--title'
            ref='title'
            type='text'
            label='Title'
            className='md-cell'
            defaultValue={book.title}
          />

          <TextField
            id='text--authors'
            ref='authors'
            type='text'
            label='Author(s)'
            className='md-cell'
            defaultValue={book.authors}
          />

          <TextField
            id='text--author-sort'
            ref='author_sort'
            type='text'
            label='Author Sort'
            className='md-cell'
            defaultValue={book.author_sort}
          />

          <TextField
            id='text--series'
            ref='series'
            type='text'
            label='Series'
            className='md-cell'
            defaultValue={book.series || ''}
          />
                    
          <TextField
            id='number--series-index'
            ref='series_index'
            type='number'
            label='Series Index'
            className='md-cell'
            defaultValue={book.series_index || 1}
          />
        </Paper>
        
        <Paper
          zDepth={1}
          component='section'
          className='cover section flex'
        >
          <Dropzone
            ref='dz'
            onDrop={f => this.onUploadCover(f)}
            className='dropzone'
          >
            <img className='cover' id={`cover-${book.id}`} />
          </Dropzone>

          <div className='buttons'>
            <Button
              flat primary
              onClick={() => this.refs.dz.open()}
              iconChildren='cloud_upload'
            >Upload Cover</Button>

            <Button
              flat secondary
              onClick={() => this.setState({ findCover: true })}
              iconChildren='search'
            >Find Cover</Button>
          </div>

          <Dialog
            fullPage
            id='dialog--find-cover'
            onHide={() => this.setState({ findCover: false })}
            visible={this.state.findCover}
          >
            <Button
              floating fixed primary
              tooltipPosition='left'
              fixedPosition='br'
              tooltipLabel='Close'
              iconChildren='close'
              onClick={() => this.setState({ findCover: false })}
            />

            <iframe
              className='cover-search'
              src={this.state.findCover ? (
                'https://www.bing.com/images/search?q=' +
                encodeURIComponent(book.authors + ' ' + book.title)
              ) : ''}
            />
          </Dialog>
        </Paper>
        
        <Paper
          zDepth={1}
          component='section'
          className='other section flex'
        >
          <TextField
            floating
            id='number--rating'
            max={5}
            ref='rating'
            type='number'
            label='Rating'
            className='md-cell'
            defaultValue={book.rating || 0}
          />
          
          <TextField
            id='textarea--tags'
            ref='tags'
            rows={2}
            type='text'
            label='Tags'
            helpText='Separate tags with a command and a space'
            className='md-cell'
            defaultValue={book.tags.join(', ')}
          />
          
          <TextField
            id='text--ids'
            ref='identifiers'
            type='text'
            label='Identifiers'
            helpText='ISBN, Amazon, etc. Format: identifier_name:id,..'
            className='md-cell'
            defaultValue={book.identifiers}
          />
          
          <DatePicker
            id='date--added'
            ref='timestamp'
            label='Date Added'
            defaultValue={new Date(book.timestamp)}
          />

          <DatePicker
            id='date--published'
            ref='pubdate'
            label='Published'
            defaultValue={book.pubdate ? new Date(book.pubdate) : ''}
          />
          
          <TextField
            id='text--publisher'
            ref='publisher'
            type='text'
            label='Publisher'
            className='md-cell'
            defaultValue={book.publisher || ''}
          />
        </Paper>
        
        <Paper
          zDepth={1}
          component='section'
          className='download-metadata section flex'
        >
          {this.state.downloadingMetadata ? (
            <p>Attempting to find metadata... This can take a while.</p>
          ) : (
            <p>xyBooks will attempt to download metadata for this book from the internet using its authors and title, or its ISBN.</p>
          )}

          <Button
            primary flat
            onClick={() => this.onDownloadMetadata()}
            disabled={this.state.downloadingMetadata}
            iconChildren='cloud_download'
          >Download Metadata</Button>
        </Paper>
        
        <Paper
          zDepth={1}
          component='section'
          className='comments section flex'
        >{this.state.editComments ? (
          <TextField
            id='textarea--comments'
            ref='comments'
            rows={2}
            type='text'
            label='Comments'
            helpText={
              'Despite the name, the comments metadata field is typically ' +
              'used for the book\'s description, but it can be used for ' +
              'anything.'
            }
            className='md-cell'
            defaultValue={book.comments || ''}
          />
        ) : (
          <div>
            <div
              ref='comments'
              className='comments'
              dangerouslySetInnerHTML={{ __html:
                book.comments || 'This book has no comments'
              }}
            />
            
            <Button
              primary flat
              onClick={() => this.setState({ editComments: true })}
              iconChildren='edit'
            >Edit Comments</Button>
          </div>
        )}</Paper>
        
        <Paper
          zDepth={1}
          component='section'
          className='formats section flex'
        >
          <table className='formats'>{
            book.formats
              .map(format => format.split('.').slice(-1)[0].toUpperCase())
              .map(format =>
                <tr key={format}>
                  <td>{format}</td>
                  <td>
                    <Button
                      icon
                      onClick={() => this.onDeleteFormat(format)}
                      iconChildren='delete'
                    />
                  </td>
                </tr>
              )
          }</table>
          
          <Button
            flat primary
            onClick={() => location.hash = buildUrl(book, 'add-format')}
            iconChildren='add'
          >Add Format</Button>
        </Paper>
        
        <Button
          primary raised
          onClick={() => this.onSaveChanges()}
          disabled={this.state.saving}
          iconChildren='save'
        >{
          this.state.saving ? 'Saving...' : 'Save'
        }</Button>
      </div>
    );
  }

}