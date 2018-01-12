import { Button } from 'react-md';
import request from 'superagent';
import marked from 'marked';
import React from 'react';

// Constants
import { XYLIBRARY_URL } from 'constants/config';

export default class ViewNote extends React.Component {

  constructor(props) {
    super(props);
  }

  onGoTo() {
    const {Reader, Notes} = this.props;

    Reader.book.rendition.display(
      Reader.state.book.notes[Notes.state.note].cfi
    );
  }

  onDelete() {
    const {Reader, Notes} = this.props;
    const {created} = Reader.state.book.notes[Notes.state.note];
    const {App} = Reader.props;
    const notes = Reader.state.book.notes.filter(n => created != n.created);

    Notes.setState({ view: 'list' });
    Reader._updateBook({ notes });
    Reader.onCycleHighlightMode();

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
        if (err || res.body.error) console.error('onDelete()', err, res);
      });
  }

  render() {
    const {Reader, Notes} = this.props;
    const note = Reader.state.book.notes[Notes.state.note];

    return (
      <div className='note'>
        <div className='highlights'>{
          note.highlights.map((hl, i) => <span key={i}>{hl}</span>)
        }</div>

        <div
          className='content markdown-body'
          dangerouslySetInnerHTML={{
            __html: marked(note.content, { sanitize: true })
          }}
        />

        <Button
          raised
          onClick={() => Notes.setState({ view: 'list' })}
          iconChildren='arrow_back'
        >Back</Button>
        <Button
          raised primary
          onClick={() => this.onGoTo()}
          iconChildren='navigation'
        >Go To</Button>
        <Button
          raised secondary
          onClick={() => this.onDelete()}
          iconChildren='delete'
        >Delete</Button>
      </div>
    );
  }

}