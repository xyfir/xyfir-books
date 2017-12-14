import { ListItem, List } from 'react-md';
import React from 'react';

export default class TableOfContents extends React.Component {

  constructor(props) {
    super(props);
  }
  
  /**
   * Load the selected chapter.
   * @param {string} href
   */
  onGoToChapter(href) {
    this.props.Reader.book.rendition.display(href);
    this.props.Reader.onCloseModal();
  }

  render() {
    return (
      <List className='table-of-contents'>{
        this.props.Reader.book.navigation.toc.map(chapter =>
          <ListItem
            key={chapter.id}
            onClick={() => this.onGoToChapter(chapter.href)}
            primaryText={chapter.label.trim()}
          />
        )
      }</List>
    );
  }

}