import { TextField, List, ListItem, Button } from 'react-md';
import request from 'superagent';
import React from 'react';

// Components
import Highlight from 'components/reader/modal/notes/Highlight';

export default class CreateNote extends React.Component {

  constructor(props) {
    super(props);
  }

  onCreate() {
    const {Reader} = this.props;
    const data = {
      cfi: Reader.book.rendition.location.start.cfi,
      range: JSON.stringify({
        start: Reader.book.rendition.location.start.cfi,
        end: Reader.book.rendition.location.end.cfi
      }),
      created: Date.now(),
      content: this._content.value,
      highlights: JSON.stringify(this._highlight._getHighlights())
    };
    
    request
      .post(`/api/books/${Reader.state.book.id}/note`)
      .send(data)
      .end((err, res) => {
        if (err || res.body.error) {
          Reader.props.alert('Could not create note.');
        }
        else {
          data.range = JSON.parse(data.range),
          data.highlights = JSON.parse(data.highlights);

          const notes = Reader.state.book.notes.concat([data]);
          
          Reader._updateBook({ notes });
          
          // Ensure highlighted content in book is updated
          Reader.onCycleHighlightMode();

          Reader.onCloseModal();
        }
      });
  }

  render() {
    return (
      <div className='create-note flex'>
        <Highlight ref={i => this._highlight = i} {...this.props} />

        <TextField
          id='textarea--note'
          ref={i => this._content = i}
          rows={2}
          type='text'
          label='Note'
          className='md-cell'
        />
        
        <div>
          <Button
            raised
            onClick={() => this.props.Notes.setState({ view: 'list' })}
            iconChildren='arrow_back'
          >Back</Button>
          <Button
            raised primary
            onClick={() => this.onCreate()}
            iconChildren='create'
          >Create</Button>
        </div>
      </div>
    );
  }

}