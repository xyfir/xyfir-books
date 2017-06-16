import request from 'superagent';
import marked from 'marked';
import React from 'react';

// react-md
import Button from 'react-md/lib/Buttons/Button';

export default class ViewNote extends React.Component {

  constructor(props) {
    super(props);
  }
  
  onGoTo() {
    epub.gotoCfi(
      this.props.reader.state.book.notes[this.props.notes.state.note].cfi
    );
  }
  
  onDelete() {
    const { book } = this.props.reader.state;
    const { created } = book.notes[this.props.notes.state.note];
    
    request
      .delete(`../api/books/${book.id}/note`)
      .send({ created })
      .end((err, res) => {
        if (err || res.body.error) {
          this.props.reader.props.alert('Could not delete note.');
        }
        else {
          const notes = book.notes.filter(n => created != n.created);

          this.props.notes.setState({ view: 'list' });
          this.props.reader._updateBook({ notes });

          // Ensure highlighted content in book is updated
          this.props.reader.onCycleHighlightMode();
        }
      });
  }

  render() {
    const note = this.props.reader.state.book
      .notes[this.props.notes.state.note];
    
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
          label='Back'
          onClick={() => this.props.notes.setState({ view: 'list' })}
        >arrow_back</Button>
        <Button
          raised primary
          label='Go To'
          onClick={() => this.onGoTo()}
        >navigation</Button>
        <Button
          raised secondary
          label='Delete'
          onClick={() => this.onDelete()}
        >delete</Button>
      </div>
    );
  }

}