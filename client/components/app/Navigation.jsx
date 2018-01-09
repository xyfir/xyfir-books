import {
  ListItem, Toolbar, Divider, Drawer, Button, List, FontIcon
} from 'react-md';
import React from 'react';

// Constants
import { READ_BOOK } from 'constants/views';
import { XYBOOKS_URL, XYDOCUMENTATION_URL } from 'constants/config';

// Components
import OpenWindow from 'components/misc/OpenWindow';

export default class AppNavigation extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      drawer: false, bookList: false
    };
  }

  /**
   * Handle the 'Book List' item being clicked in Drawer's normal set of
   * `navItems`.
   * @param {Event} e
   */
  onOpenBookList(e) {
    e.stopPropagation(); // prevent drawer from closing
    this.setState({ bookList: true });
  }

  /**
   * Handle the back button within the Drawer's Toolbar being clicked.
   */
  onDrawerBack() {
    if (this.state.bookList)
      this.setState({ bookList: false });
    else
      this.setState({ drawer: false });
  }

  /**
   * Delete access token and redirect to logout.
   */
  onLogout() {
    delete localStorage.accessToken;
    location.href = `${XYBOOKS_URL}/api/account/logout`;
  }

  /**
   * Return elements for each book list group.
   * @return {JSX.Element[]}
   */
  _renderBookListDrawerNavItems() {
    const {App} = this.props;

    return Array(
      'All', 'Authors', 'Ratings', 'Series', 'Tags'
    )
    // Convert to array of objects
    // Count unique instances within each list group
    .map((_group, i) => {
      const group = {
        name: _group, property: _group.toLowerCase(), arr: [], length: 0
      };

      // Count books for all
      if (i == 0) {
        group.length = App.state.books.length;
        return group;
      }

      App.state.books.forEach(book => {
        // Tags group
        if (group.property == 'tags') {
          return App.state.books.forEach(book =>
            book.tags.forEach(tag => {
              if (group.arr.indexOf(tag) == -1) group.arr.push(tag);
            })
          );
        }

        const value = (() => {
          switch (group.property) {
            case 'rating':
              return book.rating === undefined
                ? 0
                : Math.floor(book.rating);
            case 'series':
              if (!book.series) return;
              else return book.series;
            default:
              return book[group.property];
          }
        })();

        if (group.arr.indexOf(value) == -1)
          group.arr.push(value);
      });

      group.length = group.arr.length, delete group.arr;

      // authors -> author-sort
      if (i == 1) group.property = 'author-sort';

      return group;
    })
    // Only list groups (other than All) that have more than one subgroup
    .filter(group => group.name == 'All' || group.length > 1)
    // Return JSX elements
    .map(group =>
      <a href={'#/books/list/' + group.property} key={group.property}>
        <ListItem primaryText={`${group.name} (${group.length})`} />
      </a>
    );
  }

  /** @return {JSX.Element[]} */
  _renderNormalDrawerNavItems() {
    return [
      <ListItem
        onClick={e => this.onOpenBookList(e)}
        leftIcon={<FontIcon>book</FontIcon>}
        primaryText='Book List'
      />,
      <a href='#/books/upload'>
        <ListItem
          leftIcon={<FontIcon>file_upload</FontIcon>}
          primaryText='Upload Books'
        />
      </a>,
      <a href='#/books/recently-opened'>
        <ListItem
          leftIcon={<FontIcon>access_time</FontIcon>}
          primaryText='Recently Opened'
        />
      </a>,

      <Divider />,

      <ListItem
        leftIcon={<FontIcon>settings</FontIcon>}
        primaryText='Settings'
        nestedItems={[
          <a href='#/settings/general'>
            <ListItem
              leftIcon={<FontIcon>settings_applications</FontIcon>}
              primaryText='General'
            />
          </a>,
          <a href='#/settings/reader'>
            <ListItem
              leftIcon={<FontIcon>book</FontIcon>}
              primaryText='Reader'
            />
          </a>,
          <a href='#/settings/book-list'>
            <ListItem
              leftIcon={<FontIcon>list</FontIcon>}
              primaryText='Book List'
            />
          </a>
        ]}
      />,

      <ListItem
        leftIcon={<FontIcon>account_circle</FontIcon>}
        primaryText='Account'
        nestedItems={[
          <a href='#/library/info'>
            <ListItem
              leftIcon={<FontIcon>library_books</FontIcon>}
              primaryText='Manage Library'
            />
          </a>,
          <a href='#/account/purchase/subscription'>
            <ListItem
              leftIcon={<FontIcon>access_time</FontIcon>}
              primaryText='Subscription'
            />
          </a>,
          <a href='#/account'>
            <ListItem
              leftIcon={<FontIcon>account_box</FontIcon>}
              primaryText='My Account'
            />
          </a>,
          <a onClick={() => this.onLogout()}>
            <ListItem
              leftIcon={<FontIcon>close</FontIcon>}
              primaryText='Logout'
            />
          </a>
        ]}
      />,

      <ListItem
        leftIcon={<FontIcon>info</FontIcon>}
        primaryText='Documentation'
        nestedItems={[
          <OpenWindow href={`${XYDOCUMENTATION_URL}/xyfir-books/help`}>
            <ListItem
              leftIcon={<FontIcon>help</FontIcon>}
              primaryText='Help Docs'
            />
          </OpenWindow>,
          <OpenWindow href={`${XYDOCUMENTATION_URL}/xyfir-books/privacy`}>
            <ListItem
              leftIcon={<FontIcon>security</FontIcon>}
              primaryText='Privacy Policy'
            />
          </OpenWindow>,
          <OpenWindow href={`${XYDOCUMENTATION_URL}/xyfir-books/tos`}>
            <ListItem
              leftIcon={<FontIcon>gavel</FontIcon>}
              primaryText='Terms of Service'
            />
          </OpenWindow>
        ]}
      />
    ];
  }

  render() {
    const {App} = this.props;

    return (
      <React.Fragment>
        <Toolbar
          colored fixed
          className={App.state.view == READ_BOOK ? 'hidden' : ''}
          actions={[
            <Button
              icon
              key='search'
              onClick={() => location.hash = '#/books/list/all'}
              iconChildren='search'
            />,
            <Button
              icon
              key='home'
              onClick={() => location.hash = '#/books/recently-opened'}
              iconChildren='home'
            />
          ]}
          title={'xyBooks' + (
            Date.now() > App.state.account.subscription ? ' (free)' : ''
          )}
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
          autoclose={true}
          navItems={
            this.state.bookList
              ? this._renderBookListDrawerNavItems()
              : this._renderNormalDrawerNavItems()
          }
          visible={this.state.drawer}
          header={
            <Toolbar
              colored
              nav={
                <Button
                  icon
                  onClick={() => this.onDrawerBack()}
                  iconChildren='arrow_back'
                />
              }
            />
          }
          type={Drawer.DrawerTypes.TEMPORARY}
        />
      </React.Fragment>
    )
  }

}