import request from 'superagent';
import React from 'react';

// react-md
import TextField from 'react-md/lib/TextFields';
import ListItem from 'react-md/lib/Lists/ListItem';
import Button from 'react-md/lib/Buttons/Button';
import List from 'react-md/lib/Lists/List';

// Components
import Highlight from 'components/reader/modal/notes/Highlight';

export default class CreateNote extends React.Component {

  constructor(props) {
    super(props);
  }

  onCreate() {
    const data = {
      cfi: epub.getCurrentLocationCfi(),
      range: JSON.stringify(epub.renderer.getVisibleRangeCfi()),
      created: Date.now(),
      content: this.refs.content.value,
      highlights: JSON.stringify(this.refs.highlight._getHighlights())
    };
    
    request
      .post(`../api/books/${this.props.reader.state.book.id}/note`)
      .send(data)
      .end((err, res) => {
        if (err || res.body.error) {
          this.props.reader.props.alert('Could not create note.');
        }
        else {
          data.range = JSON.parse(data.range),
          data.highlights = JSON.parse(data.highlights);

          const notes = this.props.reader.state.book.notes.concat([data]);
          
          this.props.reader._updateBook({ notes });
          
          // Ensure highlighted content in book is updated
          this.props.reader.onCycleHighlightMode();

          this.props.reader.onCloseModal();
        }
      });
  }

  render() {
    return (
      <div className='create-note flex'>
        <Highlight ref='highlight' />

        <TextField
          id='textarea--note'
          ref='content'
          rows={2}
          type='text'
          label='Note'
          className='md-cell'
        />
        
        <div>
          <Button
            raised
            onClick={() => this.props.notes.setState({ view: 'list' })}
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