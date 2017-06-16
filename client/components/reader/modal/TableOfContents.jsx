import React from 'react';

// react-md
import ListItem from 'react-md/lib/Lists/ListItem';
import List from 'react-md/lib/Lists/List';

export default class TableOfContents extends React.Component {

  constructor(props) {
    super(props);
  }
  
  /**
   * Load the selected chapter.
   * @param {string} cfi
   */
  onGoToChapter(cfi) {
    window.epub.gotoCfi(cfi);
    this.props.reader.onCloseModal();
  }

  render() {
    return (
      <List className='table-of-contents'>{
        window.epub.toc.map(chapter =>
          <ListItem
            key={chapter.cfi}
            primaryText={chapter.label.trim()}
            onClick={() => this.onGoToChapter(chapter.cfi)}
          />
        )
      }</List>
    );
  }

}