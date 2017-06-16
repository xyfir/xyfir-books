import request from 'superagent';
import React from 'react';

// react-md
import Subheader from 'react-md/lib/Subheaders';
import ListItem from 'react-md/lib/Lists/ListItem';
import Toolbar from 'react-md/lib/Toolbars';
import Divider from 'react-md/lib/Dividers';
import Button from 'react-md/lib/Buttons/Button';
import Drawer from 'react-md/lib/Drawers';
import List from 'react-md/lib/Lists/List';

export default class ReaderNavbar extends React.Component {

  constructor(props) {
    super(props);

    this.state = { drawer: false };
    
    this._isBookmarked = this._isBookmarked.bind(this);
  }

  /**
   * Go to the previous CFI in the history.
   */
  onGoBack() {
    const history = Object.assign({}, this.props.reader.state.history);

    if (history.items.length && history.index) {
      if (history.index == -1)
        history.index = history.items.length - 1;
      else
        history.index--;

      history.ignore = true;
      
      this.props.reader.setState({ history });

      epub.gotoCfi(history.items[history.index]);
    }
  }
  
  /**
   * Create or remove a bookmark.
   */
  onBookmark() {
    const cfi = epub.getCurrentLocationCfi();
    
    // Update app/component state
    const update = bookmarks => this.props.updateBook({ bookmarks });
    
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
    return (
      <div className='toolbar'>
        <Toolbar
          colored fixed
          className={!this.props.show ? 'hidden' : ''}
          actions={[
            <Button
              icon
              onClick={() => this.onGoBack()}
            >chevron_left</Button>,

            <Button
              icon
              key='bookmark'
              onClick={() => this.onBookmark()}
            >{
              this._isBookmarked() ? 'bookmark' : 'bookmark_border'
            }</Button>,

            <Button
              icon
              key='home'
              onClick={() => location.hash = '#'}
            >home</Button>
          ]}
          nav={
            <Button
              icon
              onClick={() => this.setState({ drawer: true })}
            >menu</Button>
          }
        />

        <Drawer
          onVisibilityToggle={v => this.setState({ drawer: v })}
          autoclose={true}
          navItems={[
            <ListItem
              primaryText='Settings'
              onClick={() => location.hash = '#settings/reader'}
            />,
            <ListItem
              primaryText='Table of Contents'
              onClick={() => this.props.onToggleShow('toc')}
            />,
            <ListItem
              primaryText='Notes'
              onClick={() => this.props.onToggleShow('notes')}
            />,
            <ListItem
              primaryText='Book Styling'
              onClick={() => this.props.onToggleShow('bookStyling')}
            />,
            <ListItem
              primaryText='Filters'
              onClick={() => this.props.onToggleShow('filters')}
            />,
            <ListItem
              primaryText='View Bookmarks'
              onClick={() => this.props.onToggleShow('bookmarks')}
            />,
            <ListItem
              primaryText='Manage Annotations'
              onClick={() => this.props.onToggleShow('manageAnnotations')}
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
                >arrow_back</Button>
              }
            />
          }
          type={Drawer.DrawerTypes.TEMPORARY}
        />
      </div>
    );
  }

}