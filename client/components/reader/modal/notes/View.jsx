import { Button } from 'react-md';
import request from 'superagent';
import marked from 'marked';
import React from 'react';

// Constants
import { XYLIBRARY_URL } from 'constants/config';

// Components
import Navigation from 'components/reader/modal/Navigation';

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
      <section className='note'>
        <Navigation
          {...this.props}
          title='Note'
          actions={[
            <Button
              icon
              onClick={() => this.onGoTo()}
              iconChildren='navigation'
            />,
            <Button
              icon
              onClick={() => this.onDelete()}
              iconChildren='delete'
            />,
            <Button
              icon
              onClick={() => Notes.setState({ view: 'create' })}
              iconChildren='create'
            />,
            <Button
              icon
              onClick={() => this.props.Notes.setState({ view: 'list' })}
              iconChildren='list'
            />
          ]}
        />

        <div className='highlights'>{
          note.highlights.map((hl, i) => <span key={i}>{hl}</span>)
        }</div>

        <div
          className='content markdown-body'
          dangerouslySetInnerHTML={{
            __html: marked(note.content, { sanitize: true })
          }}
        />
      </section>
    );
  }

}