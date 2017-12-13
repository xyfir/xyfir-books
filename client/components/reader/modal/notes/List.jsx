import { TextField, ListItem, List, Button } from 'react-md';
import React from 'react';

export default class NotesList extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className='notes'>
        <Button
          raised primary
          onClick={() => this.props.Notes.setState({ view: 'create' })}
          iconChildren='create'
        >Create</Button>

        <List className='notes'>{
          this.props.Reader.state.book.notes.map((note, i) =>
            <ListItem
              threeLines
              key={note.cfi + '-' + i}
              onClick={() =>
                this.props.Notes.setState({ view: 'view', note: i })
              }
              primaryText={
                `Created ${new Date(note.created).toLocaleString()}`
              }
              secondaryText={
                (note.highlights[0].length > 50
                  ? note.highlights[0].substr(0, 47) + '...'
                  : note.highlights[0])
                + '\n'
                + (note.content.length > 50
                  ? note.content.substr(0, 47) + '...'
                  : note.content)
              }
            />
          )
        }</List>
      </div>
    );
  }

}