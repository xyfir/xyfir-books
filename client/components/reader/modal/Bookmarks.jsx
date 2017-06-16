import React from 'react';

// react-md
import ListItem from 'react-md/lib/Lists/ListItem';
import List from 'react-md/lib/Lists/List';

export default class Bookmarks extends React.Component {

  constructor(props) {
    super(props);
  }
  
  /**
   * Go to the bookmark's CFI.
   * @param {string} cfi 
   */
  onGoToBookmark(cfi) {
    epub.gotoCfi(cfi);
    this.props.reader.onCloseModal();
  }

  render() {
    const { bookmarks } = this.props.reader.state.book;

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