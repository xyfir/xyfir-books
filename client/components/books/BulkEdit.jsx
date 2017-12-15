import { Paper, Button, TextField, SelectField, Checkbox } from 'react-md';
import titleCase from 'titlecase';
import request from 'superagent';
import React from 'react';
import swal from 'sweetalert';

// Modules
import loadBooks from 'lib/books/load-from-api';

// Constants
import { LIBRARY } from 'constants/config';

export default class EditBooks extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = {
      ids: location.hash.split('/')[3].split(',').map(Number),
      status: ''
    };
  }
  
  async onSaveChanges() {
    if (!navigator.onLine)
      return swal('Error', 'Internet connectivity needed', 'error');

    this.setState({ status: 'Allocating space on server' });

    for (let id of this.state.ids) {
      const book = this.props.data.books.find(b => id == b.id);
      
      // Skip book or abort editing
      if (!book) {
        this.setState({ status: `Could not find book with id '${id}'.` });

        if (window['checkbox--stop-on-error'].checked) return;
        else continue;
      }

      this.setState({ status: `Editing book '${book.title || id}'` });

      // Build data object to send to server
      const data = {};
      
      // Swap authors / title
      if (window['checkbox--author-title-swap'].checked) {
        data.authors = book.title;
        data.title = book.authors;
      }
      // Set authors
      if (this._authors.value != '') {
        data.authors = this._authors.value;
      }
      // Format title
      if (window['checkbox--format-title'].checked) {
        data.title = titleCase(data.title || book.title);
      }
      // Rating
      if (this._rating.value != '') {
        data.rating = +this._rating.value;
        
        if (data.rating > 0) data.rating = data.rating / 2;
      }
      // Publisher
      if (this._publisher.value != '') {
        data.publisher = this._publisher.value;
      }
      // Published
      if (this._published.value != '') {
        data.pubdate = (new Date(this._published.value)).toISOString();
      }
      // Set data.tags
      if (this._addTags.value != '' || this._remTags.value != '') {
        data.tags = book.tags;

        // Add tags
        if (this._addTags.value != '') {
          data.tags = data.tags.concat(this._addTags.value.split(', '));
        }
        // Remove tags
        if (this._remTags.value != '') {
          const remove = this._remTags.value.toLowerCase().split(', ');
          
          data.tags = data.tags.filter(t1 =>
            remove.indexOf(t1.toLowerCase()) == -1
          );
        }

        data.tags = data.tags.join(', ');
      }
      // Clear tags
      if (window['checkbox--clear-tags'].checked) {
        data.tags = '';
      }
      // Set series
      if (this._series.value != '') {
        data.series = this._series.value;
      }
      // Clear series
      if (window['checkbox--clear-series'].checked) {
        data.series = '';
      }
      // Date added
      if (this._timestamp.value != '') {
        data.timestamp = (new Date(this._timestamp.value)).toISOString();
      }
      // Comments
      if (this._comments.value != '') {
        data.comments = this._comments.value;
      }

      this.setState({ status: 'Sending new metadata to server' });

      // Update book's metadata
      try {
        const res = await request
          .put(
            `${LIBRARY}libraries/${this.props.data.account.library}/books/` +
            `${id}/metadata`
          )
          .send({
            data: JSON.stringify(data)
          });

        if (res.body.error) throw res.body.error;
      }
      catch (err) {
        if (window['checkbox--stop-on-error'].checked) {
          return this.setState({
            status: `Error updating '${data.title || book.title || id}'.`
          });
        }
        else {
          this.setState({
            status: `Error updating '${data.title || book.title || id}'.`
          });
          continue;
        }
      }
    }

    this.setState({ status: '' });
    swal('Action Complete', '', 'success');

    // Update state.books and local storage
    loadBooks(
      this.props.data.account.library,
      this.props.dispatch
    );
  }

  render() {
    return (
      <div className='edit-books'>
        <Paper
          zDepth={1}
          component='section'
          className='authors section flex'
        >
          <TextField
            id='text--authors'
            ref={i => this._authors = i}
            type='text'
            label='Authors'
            className='md-cell'
          />

          <TextField
            id='text--author-sort'
            ref={i => this._authorSort = i}
            type='text'
            label='Author Sort'
            className='md-cell'
          />

          <Checkbox
            id='checkbox--author-title-swap'
            label='Swap Title / Authors'
          />
        </Paper>
        
        <Paper
          zDepth={1}
          component='section'
          className='publish section flex'
        >
          <TextField
            id='text--publisher'
            ref={i => this._publisher = i}
            type='text'
            label='Publisher'
            className='md-cell'
          />

          <TextField
            id='text--published'
            ref={i => this._published = i}
            type='text'
            label='Published (Date)'
            className='md-cell'
            placeholder='YYYY-MM-DD'
          />
        </Paper>
          
        <Paper
          zDepth={1}
          component='section'
          className='tags section flex'
        >
          <TextField
            id='text--add-tags'
            ref={i => this._addTags = i}
            type='text'
            label='Add Tags'
            className='md-cell'
          />

          <TextField
            id='text--remove-tags'
            ref={i => this._remTags = i}
            type='text'
            label='Remove Tags'
            className='md-cell'
          />

          <Checkbox
            id='checkbox--clear-tags'
            label='Clear Tags'
          />
        </Paper>
        
        <Paper
          zDepth={1}
          component='section'
          className='misc section flex'
        >
          <TextField
            id='number--rating'
            max={5}
            ref={i => this._rating = i}
            step={0.5}
            type='number'
            label='Rating'
            className='md-cell'
          />

          <TextField
            id='text--series'
            ref={i => this._series = i}
            type='text'
            label='Series'
            className='md-cell'
          />

          <Checkbox
            id='checkbox--clear-series'
            label='Clear Series'
          />

          <TextField
            id='text--timestamp'
            ref={i => this._timestamp = i}
            type='text'
            label='Date Added'
            className='md-cell'
            placeholder='YYYY-MM-DD'
          />

          <TextField
            id='text--comments'
            ref={i => this._comments = i}
            rows={2}
            type='text'
            label='Comments'
            className='md-cell'
          />

          <Checkbox
            id='checkbox--format-title'
            label='Convert Title to Title Case'
          />

          <Checkbox
            id='checkbox--stop-on-error'
            label='Stop Editing on Error'
            defaultChecked={true}
          />
        </Paper>

        <p><strong>Note:</strong> Fields left blank will not be changed</p>

        {this.state.status ? (
          <p className='status'>
            <strong>Status:</strong> {this.state.status}
          </p>
        ) : null}

        <Button
          primary raised
          iconChildren='save'
          onClick={() => this.onSaveChanges()}
        >Save Changes</Button>
      </div>
    );
  }

}