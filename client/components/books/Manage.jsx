import {
  DatePicker, TextField, Button, DialogContainer, Paper
} from 'react-md';
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
import { XYLIBRARY_URL } from 'constants/config';

// Action creators
import { deleteFormat, incrementVersion } from 'actions/creators/books';

export default class ManageBook extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      id: window.location.hash.split('/')[3],
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

    let query = {};

    // Get metadata using ISBN
    this._identifiers.value
      .split(', ')
      .forEach(id => {
        const t = id.split(':');

        if (t[0] == 'isbn') query = { isbn: t[1] };
      });

    // Get metadata using author/title
    if (!query.isbn) {
      query = {
        author: this._authors.value,
        title: this._title.value
      };
    }

    request
      .get(
        `${XYLIBRARY_URL}/libraries/${this.props.data.account.library}` +
        `/books/${this.state.id}/metadata`
      )
      .query(query)
      .end((err, res) => {
        if (err || res.body.error) {
          this.setState({ downloadingMetadata: false });
          return swal('Error', 'Could not find metadata', 'error');
        }

        res.body.metadata
          .split('\n')
          .forEach((kv, i) => {
            let [key, value] = kv.split('   : ');
            key = key.trim(),
            value = (value || '').trim();

            switch (key) {
              case 'Title':
                return this._title.getField().value = value;
              case 'Author(s)':
                return this._authors.getField().value = value;
              case 'Publisher':
                return this._publisher.getField().value = value;
              case 'Tags':
                return this._tags.getField().value = value;
              case 'Published':
                return this._pubdate._setCalendarTempDate(new Date(value));
              case 'Identifiers':
                return this._identifiers.getField().value = value;
              case 'Comments':
                // Comments can have newlines and comments is always last field
                const comments = [value]
                  .concat(res.body.metadata.split('\n').splice(i + 1))
                  .join(' ');
                if (this.state.editComments)
                  this._comments.getField().value = comments;
                else
                  this._comments.innerHTML = comments;
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
        `${XYLIBRARY_URL}/libraries/${this.props.data.account.library}` +
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
        `${XYLIBRARY_URL}/libraries/${this.props.data.account.library}` +
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

    const data = {
      identifiers: this._identifiers.value,
      author_sort: this._authorSort.value,
      publisher: this._publisher.value,
      timestamp: moment(this._timestamp.state.calendarTempDate).toISOString(),
      authors: this._authors.value,
      pubdate: moment(this._pubdate.state.calendarTempDate).toISOString(),
      rating: this._rating.value,
      title: this._title.value,
      tags: this._tags.value
    };

    // Calibre doubles rating for some reason...
    data.rating = data.rating > 0 ? data.rating / 2 : data.rating;

    if (this._series.value != '') {
      data.series = this._series.value;
      data.series_index = this._seriesIndex.value;
    }

    if (this._comments.getField)
      data.comments = this._comments.value;
    else
      data.comments = this._comments.innerHTML;

    // Send to xyLibrary
    request
      .put(
        `${XYLIBRARY_URL}/libraries/${this.props.data.account.library}` +
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
            ref={i => this._title = i}
            type='text'
            label='Title'
            className='md-cell'
            defaultValue={book.title}
          />

          <TextField
            id='text--authors'
            ref={i => this._authors = i}
            type='text'
            label='Author(s)'
            className='md-cell'
            defaultValue={book.authors}
          />

          <TextField
            id='text--author-sort'
            ref={i => this._authorSort = i}
            type='text'
            label='Author Sort'
            className='md-cell'
            defaultValue={book.author_sort}
          />

          <TextField
            id='text--series'
            ref={i => this._series = i}
            type='text'
            label='Series'
            className='md-cell'
            defaultValue={book.series || ''}
          />

          <TextField
            id='number--series-index'
            ref={i => this._seriesIndex = i}
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
            ref={i => this._dz = i}
            onDrop={f => this.onUploadCover(f)}
            className='dropzone'
          >
            <img className='cover' id={`cover-${book.id}`} />
          </Dropzone>

          <div className='buttons'>
            <Button
              flat primary
              onClick={() => this._dz.open()}
              iconChildren='cloud_upload'
            >Upload Cover</Button>

            <Button
              flat secondary
              onClick={() => this.setState({ findCover: true })}
              iconChildren='search'
            >Find Cover</Button>
          </div>

          <DialogContainer
            fullPage
            id='dialog--find-cover'
            onHide={() => this.setState({ findCover: false })}
            visible={this.state.findCover}
            aria-label='find-book-cover'
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
          </DialogContainer>
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
            ref={i => this._rating = i}
            type='number'
            label='Rating'
            className='md-cell'
            defaultValue={book.rating || 0}
          />

          <TextField
            id='textarea--tags'
            ref={i => this._tags = i}
            rows={2}
            type='text'
            label='Tags'
            helpText='Separate tags with a command and a space'
            className='md-cell'
            defaultValue={book.tags.join(', ')}
          />

          <TextField
            id='text--ids'
            ref={i => this._identifiers = i}
            type='text'
            label='Identifiers'
            helpText='ISBN, Amazon, etc. Format: identifier_name:id,..'
            className='md-cell'
            defaultValue={
              Object
                .entries(book.identifiers)
                .map(id => `${id[0]}:${id[1]}`)
                .join(', ')
            }
          />

          <DatePicker
            id='date--added'
            ref={i => this._timestamp = i}
            label='Date Added'
            defaultValue={new Date(book.timestamp)}
          />

          <DatePicker
            id='date--published'
            ref={i => this._pubdate = i}
            label='Published'
            defaultValue={book.pubdate ? new Date(book.pubdate) : ''}
          />

          <TextField
            id='text--publisher'
            ref={i => this._publisher = i}
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
            ref={i => this._comments = i}
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
              ref={i => this._comments = i}
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
        >{this.state.saving ? 'Saving...' : 'Save'}</Button>
      </div>
    );
  }

}