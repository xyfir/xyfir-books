import { TextField, List, ListItem, Button } from 'react-md';
import request from 'superagent';
import React from 'react';

// Components
import Highlight from 'components/reader/modal/notes/Highlight';

// Constants
import { XYLIBRARY_URL } from 'constants/config';

export default class CreateNote extends React.Component {

  constructor(props) {
    super(props);
  }

  onCreate() {
    const {Reader} = this.props;
    const {App} = Reader.props;
    const notes = Reader.state.book.notes.concat([{
      cfi: Reader.book.rendition.location.start.cfi,
      range: {
        start: Reader.book.rendition.location.start.cfi,
        end: Reader.book.rendition.location.end.cfi
      },
      created: Date.now(),
      content: this._content.value,
      highlights: this._highlight._getHighlights()
    }]);

    Reader._updateBook({ notes });
    Reader.onCycleHighlightMode();
    Reader.onCloseModal();

    request
      .put(
        `${XYLIBRARY_URL}/libraries/${App.state.account.library}` +
        `/books/${Reader.state.book.id}/metadata`
      )
      .send({
        xyfir: {
          notes: JSON.stringify(notes)
        }
      })
      .end((err, res) => {
        if (err || res.body.error) console.error('onCreate()', err, res);
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