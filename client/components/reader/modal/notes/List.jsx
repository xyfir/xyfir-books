import React from 'react';

// react-md
import TextField from 'react-md/lib/TextFields';
import ListItem from 'react-md/lib/Lists/ListItem';
import Button from 'react-md/lib/Buttons/Button';
import List from 'react-md/lib/Lists/List';

export default class NotesList extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className='notes'>
        <Button
          raised primary
          label='Create'
          onClick={() => this.props.notes.setState({ view: 'create' })}
        >create</Button>

        <List className='notes'>{
          this.props.reader.state.book.notes.map((note, i) =>
            <ListItem
              threeLines
              key={note.cfi + '-' + i}
              onClick={
                () => this.props.notes.setState({ view: 'view', note: i })
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