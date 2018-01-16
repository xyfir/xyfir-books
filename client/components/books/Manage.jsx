import {
  DatePicker, TextField, Button, Paper
} from 'react-md';
import Dropzone from 'react-dropzone';
import request from 'superagent';
import moment from 'moment';
import React from 'react';

// Modules
import loadCovers from 'lib/books/load-covers';
import openWindow from 'lib/util/open-window';
import loadBooks from 'lib/books/load-from-api';
import buildUrl from 'lib/url/build';

// Constants
import { XYLIBRARY_URL } from 'constants/config';

// Action creators
import { deleteFormat } from 'actions/books';

export default class ManageBook extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      id: +window.location.hash.split('/')[3],
      downloadingMetadata: false,
      embeddingMetadata: false,
      editComments: false,
      saving: false
    };
  }

  componentDidMount() {
    const {books, account} = this.props.App.state;
    loadCovers(books, account.library);
  }

  onDownloadMetadata() {
    const {App} = this.props;

    if (!navigator.onLine) return App._alert('Internet connection required');

    this.setState({ downloadingMetadata: true });

    const query = {};

    // Get metadata using ISBN
    this._identifiers.value
      .split(', ')
      .forEach(id => {
        const [key, val] = id.split(':');

        if (key == 'isbn') query.isbn = val;
      });

    // Get metadata using author/title
    if (!query.isbn) {
      query.author = this._authors.value,
      query.title = this._title.value;
    }

    request
      .get(
        `${XYLIBRARY_URL}/libraries/${App.state.account.library}` +
        `/books/${this.state.id}/metadata/fetch`
      )
      .query(query)
      .end((err, res) => {
        if (err || res.body.error) {
          this.setState({ downloadingMetadata: false });
          return App._alert('Could not find metadata');
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

  onEmbedMetadata() {
    const {App} = this.props;

    if (!navigator.onLine) return App._alert('Internet connection required');

    this.setState({ embeddingMetadata: true });

    request
      .post(
        `${XYLIBRARY_URL}/libraries/${App.state.account.library}` +
        `/books/${this.state.id}/metadata/embed`
      )
      .end((err, res) => {
        this.setState({ embeddingMetadata: false });

        if (err || res.body.error)
          return App._alert('Could not embed metadata');
        else
          return App._alert('Metadata embedded');
      });
  }

  onDeleteFormat(f) {
    const {App} = this.props;

    if (!navigator.onLine) return App._alert('Internet connection required');

    request
      .delete(
        `${XYLIBRARY_URL}/libraries/${App.state.account.library}` +
        `/books/${this.state.id}/format/${f}`
      )
      .end((err, res) => {
        if (err || res.body.error)
          App._alert('Could not delete format');
        else
          App.store.dispatch(deleteFormat(this.state.id, f));
      });
  }

  /** @param {File} file */
  onUploadCover(file) {
    const {App} = this.props;

    if (!navigator.onLine) return App._alert('Internet connection required');

    request
      .put(
        `${XYLIBRARY_URL}/libraries/${App.state.account.library}` +
        `/books/${this.state.id}/cover`
      )
      .attach('cover', file)
      .end((err, res) => {
        if (res.error) return App._alert('Could not upload file');

        localforage.setItem(`cover-${this.state.id}`, file)
          .then(img => {
            // Load new cover
            document.querySelector('img.cover').src = file.preview;
          })
          .catch(err => location.reload());
      });
  }

  onSaveChanges() {
    const {App} = this.props;

    if (!navigator.onLine) return App._alert('Internet connection required');

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
        `${XYLIBRARY_URL}/libraries/${App.state.account.library}` +
        `/books/${this.state.id}/metadata`
      )
      .send({
        normal: data
      })
      .end((err, res) => {
        this.setState({ saving: false });

        if (err || res.body.error) return App._alert('Could not update book');

        // Reload state.books and update local storage books
        loadBooks(App.state.account.library, App.store.dispatch);
      });
  }

  render() {
    const {App} = this.props;
    const book = App.state.books.find(b => this.state.id == b.id);

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
            label='Series Number'
            className='md-cell'
            defaultValue={book.series_index || 1}
          />

          <div>
            <Button
              primary flat
              onClick={() => this.onDownloadMetadata()}
              disabled={this.state.downloadingMetadata}
              iconChildren='cloud_download'
              tooltipLabel={
                'Using available data, metadata will be downloaded from ' +
                'various internet sources'
              }
              tooltipPosition='top'
            >{
              this.state.downloadingMetadata
                ? 'Downloading...'
                : 'Download Metadata'
            }</Button>

            <Button
              secondary flat
              onClick={() => this.onEmbedMetadata()}
              disabled={this.state.embeddingMetadata}
              iconChildren='archive'
              tooltipLabel={
                `This book's metadata from your library's database will be ` +
                `embedded into the actual ebook files`
              }
              tooltipPosition='top'
            >{
              this.state.embeddingMetadata
                ? 'Embedding...'
                : 'Embed Metadata'
            }</Button>
          </div>
        </Paper>

        <Paper
          zDepth={1}
          component='section'
          className='cover section flex'
        >
          <Dropzone
            ref={i => this._dz = i}
            onDrop={f => this.onUploadCover(f[0])}
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
              onClick={() =>
                openWindow(
                  `https://www.google.com/search?q=${
                    encodeURIComponent(book.authors + ' ' + book.title)
                  }&tbm=isch`
                )
              }
              iconChildren='search'
            >Find Cover</Button>
          </div>
        </Paper>

        <Paper
          zDepth={1}
          component='section'
          className='other section flex'
        >
          <TextField
            floating
            id='number--rating'
            min={0}
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
            helpText='Separate tags with a comment and a space'
            className='md-cell'
            defaultValue={book.tags.join(', ')}
          />

          <TextField
            id='text--ids'
            ref={i => this._identifiers = i}
            type='text'
            label='Identifiers'
            helpText='ISBN, Amazon, etc. Format: name:id, name:id, ...'
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
          className='comments section flex'
        >{this.state.editComments ? (
          <TextField
            id='textarea--comments'
            ref={i => this._comments = i}
            rows={2}
            type='text'
            label='Comments'
            helpText={
              `Despite the name, the comments metadata field is typically ` +
              `used for the book's description, but it can be used for ` +
              `anything. HTML is supported.`
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