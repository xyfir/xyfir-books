import { List, ListItem } from 'react-md';
import React from 'react';

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
      <List className='bookmarks'>{
        bookmarks.reverse().map((bm, i) =>
          <ListItem
            key={i}
            onClick={() => this.onGoToBookmark(bm.cfi)}
            primaryText={`Bookmark #${bookmarks.length - i}`}
            secondaryText={
              `Created ${new Date(bm.created).toLocaleString()}`
            }
          />
        )
      }</List>
    );
  }

}