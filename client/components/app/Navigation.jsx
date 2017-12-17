import {
  ListItem, Toolbar, Divider, Drawer, Button, List, FontIcon
} from 'react-md';
import React from 'react';

// Constants
import { READ_BOOK } from 'constants/views';

export default class AppNavigation extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      drawer: false
    };
  }

  /**
   * Delete access token and redirect to logout.
   */
  onLogout() {
    delete localStorage.accessToken;
    location.href = '/api/account/logout';
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
          navItems={[
            <a href='#/books/list'>
              <ListItem
                leftIcon={<FontIcon>book</FontIcon>}
                primaryText='Book List'
              />
            </a>,
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
      </React.Fragment>
    )
  }
}