import {
  Subheader, ListItem, Toolbar, Divider, Button, Drawer, List, FontIcon
} from 'react-md';
import request from 'superagent';
import React from 'react';

// Constants
import { XYBOOKS_URL } from 'constants/config';

export default class ReaderNavbar extends React.Component {

  constructor(props) {
    super(props);

    this.state = { drawer: false };

    this._isBookmarked = this._isBookmarked.bind(this);
  }

  /**
   * Go to the previous CFI in the history.
   * @todo For some reason this needs to be called twice to work.
   */
  onGoBack() {
    const {Reader} = this.props;
    const history = Object.assign({}, Reader.state.history);

    if (history.items.length && history.index) {
      if (history.index == -1)
        history.index = history.items.length - 1;
      else
        history.index--;

      history.ignore = true;

      Reader.setState({ history });

      Reader.book.rendition.display(history.items[history.index]);
    }
  }

  /**
   * Create or remove a bookmark.
   */
  onBookmark() {
    const {Reader} = this.props;
    const cfi = Reader.book.rendition.location.start.cfi;

    // Update app/component state
    const update = bookmarks => Reader._updateBook({ bookmarks });

    // Remove bookmark
    if (this._isBookmarked()) {
      request
        .delete(`${XYBOOKS_URL}/api/books/${Reader.state.book.id}/bookmark`)
        .send({ cfi })
        .end((err, res) => {
          if (!err && !res.body.error)
            update(Reader.state.book.bookmarks.filter(bm => cfi != bm.cfi));
        });
    }
    // Add bookmark
    else {
      request
        .post(`${XYBOOKS_URL}/api/books/${Reader.state.book.id}/bookmark`)
        .send({ cfi })
        .end((err, res) => {
          if (!res.body.error) {
            update(
              Reader.state.book.bookmarks.concat([{
                cfi, created: Date.now()
              }])
            );
          }
        });
    }
  }

  /**
   * Check if the books's current CFI is bookmarked
   * @return {boolean}
   */
  _isBookmarked() {
    const {Reader} = this.props;
    const cfi = Reader.book.rendition.location.start.cfi;

    return Reader.state.book.bookmarks.findIndex(b => cfi == b.cfi) > -1;
  }

  render() {
    const {Reader} = this.props;

    return (
      <div className='toolbar'>
        <Toolbar
          colored fixed
          className={!this.props.show ? 'hidden' : ''}
          actions={[
            <Button
              icon
              onClick={() => this.onGoBack()}
              iconChildren='chevron_left'
            />,

            <Button
              icon
              key='bookmark'
              onClick={() => this.onBookmark()}
              iconChildren={
                this._isBookmarked() ? 'bookmark' : 'bookmark_border'
              }
            />,

            <Button
              icon
              key='home'
              onClick={() => location.hash = '#/books/recently-opened'}
              iconChildren='home'
            />
          ]}
          nav={
            <Button
              icon
              onClick={() => this.setState({ drawer: true })}
              iconChildren='menu'
            />
          }
        />

        <Drawer
          onVisibilityChange={v => this.setState({ drawer: v })}
          overlayClassName='reader-drawer-overlay'
          autoclose={true}
          navItems={[
            <ListItem
              primaryText='Settings'
              leftIcon={<FontIcon>settings</FontIcon>}
              onClick={() => location.hash = '#/settings/reader'}
            />,
            <ListItem
              primaryText='Table of Contents'
              leftIcon={<FontIcon>book</FontIcon>}
              onClick={() => Reader.onToggleShow('toc')}
            />,
            <ListItem
              primaryText='Notes'
              leftIcon={<FontIcon>note</FontIcon>}
              onClick={() => Reader.onToggleShow('notes')}
            />,
            <ListItem
              primaryText='Book Styling'
              leftIcon={<FontIcon>style</FontIcon>}
              onClick={() => Reader.onToggleShow('bookStyling')}
            />,
            <ListItem
              primaryText='Filters'
              leftIcon={<FontIcon>filter</FontIcon>}
              onClick={() => Reader.onToggleShow('filters')}
            />,
            <ListItem
              primaryText='View Bookmarks'
              leftIcon={<FontIcon>bookmark</FontIcon>}
              onClick={() => Reader.onToggleShow('bookmarks')}
            />,
            <ListItem
              primaryText='Manage Annotations'
              leftIcon={<FontIcon>speaker_notes</FontIcon>}
              onClick={() => Reader.onToggleShow('manageAnnotations')}
            />
          ]}
          visible={this.state.drawer}
          header={
            <Toolbar
              colored
              nav={
                <Button
                  icon
                  onClick={() => this.setState({ drawer: false })}
                  iconChildren='arrow_back'
                />
              }
            />
          }
          type={Drawer.DrawerTypes.TEMPORARY}
        />
      </div>
    );
  }

}