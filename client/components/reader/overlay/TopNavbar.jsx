import request from 'superagent';
import React from 'react';

// Modules
import showNavbarText from 'lib/misc/show-navbar-text';

export default class TopReaderNavbar extends React.Component {

  constructor(props) {
    super(props);
    
    this._isBookmarked = this._isBookmarked.bind(this);
  }
  
  /**
   * Create or remove a bookmark.
   */
  onBookmark() {
    const cfi = epub.getCurrentLocationCfi();
    
    // Update app/component state
    const update = (bookmarks) => this.props.updateBook({ bookmarks });
    
    // Remove bookmark
    if (this._isBookmarked()) {
      request
        .delete(`../api/books/${this.props.book.id}/bookmark`)
        .send({ cfi })
        .end((err, res) => {
          if (!err && !res.body.error)
            update(this.props.book.bookmarks.filter(bm => cfi != bm.cfi));
        });
    }
    // Add bookmark
    else {
      request
        .post(`../api/books/${this.props.book.id}/bookmark`)
        .send({ cfi })
        .end((err, res) => {
          if (!res.body.error) {
            update(
              this.props.book.bookmarks.concat([{
                cfi, created: Date.now()
              }])
            );
          }
        });
    }
  }
  
  /**
   * Check if the epub's current CFI is bookmarked
   * @returns {boolean}
   */
  _isBookmarked() {
    const cfi = epub.getCurrentLocationCfi();
    return !!this.props.book.bookmarks.find(b => cfi == b.cfi);
  }

  render() {
    const showText = showNavbarText();
    
    if (!this.props.show) return <div />;

    return (
      <nav className='navbar top'>
        <a
          className='icon-home'
          title='Home / Recently Opened'
          href='#books/recently-opened'
        >{showText ? 'Home' : ''}</a>

        <a
          className='icon-settings'
          title='Settings'
          href='#settings/reader'
        >{showText ? 'Settings' : ''}</a>

        <a
          onClick={() => this.props.onToggleShow('toc')}
          className='icon-book'
          title='Table of Contents'
        >{showText ? 'TOC' : ''}</a>

        <a
          onClick={() => this.props.onToggleShow('createNote')}
          className='icon-edit'
          title='Create Note'
        >{showText ? 'Note' : ''}</a>

        <a
          onClick={() => this.props.onToggleShow('more')}
          className='icon-more'
          title='More...'
        >{showText ? 'More' : ''}</a>

        <a
          onClick={() => this.onBookmark()}
          className={
            this._isBookmarked()
            ? 'icon-bookmark'
            : 'icon-bookmark-empty'
          }
          title='Bookmark'
        >{showText ? 'Bookmark' : ''}</a>
      </nav>
    );
  }

}