import {
  FontIcon, Button, ListItem, DialogContainer, List
} from 'react-md';
import request from 'superagent';
import React from 'react';

// Modules
import loadBooksFromApi from 'lib/books/load-from-api';

// Components
import OpenWindow from 'components/misc/OpenWindow';

// Constants
import { XYLIBRARY_URL } from 'constants/config';

export default class NoBooks extends React.Component {

  constructor(props) {
    super(props);

    this.state = { dialog: false };
  }

  async onLoadSampleLibrary() {
    if (!navigator.onLine) return App._alert('Internet connection required');

    const {App} = this.props;

    const confirm = await swal({
      title: 'Are you sure?',
      text: `This will wipe any data stored in your library.`,
      icon: 'warning',
      buttons: true
    });

    if (!confirm) return;

    request
      .post(`${XYLIBRARY_URL}/libraries/${App.state.account.library}/sample`)
      .end((err, res) => {
        if (err || res.body.error)
          return App._alert('Could not update library');

        loadBooksFromApi(App.state.account.library);
        App._alert('Your library has been updated');
      });
  }

  render() {
    return (
      <section className='no-books container'>
        <h1>You don't have any books in your library!</h1>
        <Button
          raised primary
          iconChildren='book'
          onClick={() => this.setState({ dialog: true })}
        >Get Books</Button>

        <DialogContainer
          id='book-sources'
          onHide={() => this.setState({ dialog: false })}
          visible={this.state.dialog}
          aria-label='book sources'
          dialogClassName='no-books book-sources'
        >
          <List>
            <ListItem
              onClick={() => this.onLoadSampleLibrary()}
              leftIcon={<FontIcon>find_replace</FontIcon>}
              primaryText='Load free sample books'
              secondaryText={
                'Your library will be replaced with some popular books ' +
                'from Project Gutenberg'
              }
            />
            <OpenWindow href='http://www.gutenberg.org'>
              <ListItem
                leftIcon={<FontIcon>search</FontIcon>}
                primaryText='Find free books online'
                secondaryText='Search free books on Project Gutenberg'
              />
            </OpenWindow>
            <a href='#/library/upload'>
              <ListItem
                leftIcon={<FontIcon>library_add</FontIcon>}
                primaryText='Upload an entire library'
                secondaryText='Upload a zipped, Calibre-compatible library'
              />
            </a>
            <a href='#/books/upload'>
              <ListItem
                leftIcon={<FontIcon>file_upload</FontIcon>}
                primaryText='Upload books via app'
                secondaryText='Upload ebook files directly in xyBooks'
              />
            </a>
            <a href='#/books/upload?email=1'>
              <ListItem
                leftIcon={<FontIcon>email</FontIcon>}
                primaryText='Upload books via email'
                secondaryText='Send ebook files from any device via email'
              />
            </a>
          </List>
        </DialogContainer>
      </section>
    )
  }

}