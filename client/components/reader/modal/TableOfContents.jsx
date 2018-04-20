import { ListItem, List } from 'react-md';
import React from 'react';

// Components
import Navigation from 'components/reader/modal/Navigation';

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
      <section className="table-of-contents list-container">
        <Navigation {...this.props} title="Table of Contents" />

        <List>
          {this.props.Reader.book.navigation.toc.map(chapter => (
            <ListItem
              key={chapter.id}
              onClick={() => this.onGoToChapter(chapter.href)}
              primaryText={chapter.label.trim()}
            />
          ))}
        </List>
      </section>
    );
  }
}
