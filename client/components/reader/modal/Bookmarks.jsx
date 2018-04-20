import { List, ListItem } from 'react-md';
import React from 'react';

// Components
import Navigation from 'components/reader/modal/Navigation';

export default class Bookmarks extends React.Component {
  constructor(props) {
    super(props);
  }

  /**
   * Go to the bookmark's CFI.
   * @param {string} cfi
   */
  onGoToBookmark(cfi) {
    this.props.Reader.book.rendition.display(cfi);
    this.props.Reader.onCloseModal();
  }

  render() {
    const { bookmarks } = this.props.Reader.state.book;

    return (
      <section className="bookmarks list-container">
        <Navigation {...this.props} title="Bookmarks" />

        {bookmarks.length ? (
          <List>
            {bookmarks
              .reverse()
              .map(bm => (
                <ListItem
                  key={bm.created}
                  onClick={() => this.onGoToBookmark(bm.cfi)}
                  primaryText={new Date(bm.created).toLocaleString()}
                />
              ))}
          </List>
        ) : (
          <p>You don't have any bookmarks!</p>
        )}
      </section>
    );
  }
}
