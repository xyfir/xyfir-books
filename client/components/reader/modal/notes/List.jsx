import { TextField, ListItem, List, Button } from 'react-md';
import React from 'react';

// Components
import Navigation from 'components/reader/modal/Navigation';

export default class NotesList extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const {Notes, Reader} = this.props;

    return (
      <section className='notes list-container'>
        <Navigation
          {...this.props}
          title='Notes'
          actions={[
            <Button
              icon
              onClick={() => Notes.setState({ view: 'create' })}
              iconChildren='create'
            />
          ]}
        />

        {Reader.state.book.notes.length ? (
          <List className='notes'>{
            Reader.state.book.notes.map((note, i) =>
              <ListItem
                threeLines
                key={note.cfi + '-' + i}
                onClick={() =>
                  Notes.setState({ view: 'view', note: i })
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
        ) : (
          <p>You don't have any notes!</p>
        )}
      </section>
    );
  }

}