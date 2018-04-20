import { Toolbar, Button, Drawer } from 'react-md';
import PropTypes from 'prop-types';
import React from 'react';

export default class ReaderModalNavigation extends React.Component {
  constructor(props) {
    super(props);

    this.state = { drawer: false };
  }

  onResize() {
    const { Modal } = this.props;
    Modal.setState({ fullscreen: !Modal.state.fullscreen });
  }

  onClose() {
    const { Modal, Reader } = this.props;

    // For some reason if the user closes while in fullscreen and then
    // reopens and clicks the 'shrink' button the Dialog breaks
    if (Modal.state.canResize)
      Modal.setState({ fullscreen: false }, () => Reader.onCloseModal());
    else Reader.onCloseModal();
  }

  render() {
    const { Modal, title, drawerItems, noSizing } = this.props;
    const actions = this.props.actions.slice();

    if (Modal.state.canResize && !noSizing) {
      actions.push(
        <Button
          icon
          iconChildren={
            Modal.state.fullscreen ? 'fullscreen_exit' : 'fullscreen'
          }
          onClick={() => this.onResize()}
        />
      );
    }
    if (drawerItems.length) {
      actions.push(
        <Button
          icon
          onClick={() => this.setState({ drawer: true })}
          iconChildren="menu"
        />
      );
    }

    return (
      <React.Fragment>
        <Toolbar
          colored
          actions={actions}
          title={title}
          nav={
            <Button icon onClick={() => this.onClose()} iconChildren="close" />
          }
        />

        {drawerItems.length ? (
          <Drawer
            onVisibilityChange={v => this.setState({ drawer: v })}
            autoclose={true}
            position="right"
            navItems={drawerItems}
            visible={this.state.drawer}
            overlay={false}
            header={
              <Toolbar
                colored
                nav={
                  <Button
                    icon
                    onClick={() => this.setState({ drawer: false })}
                    iconChildren="arrow_forward"
                  />
                }
              />
            }
            type={Drawer.DrawerTypes.TEMPORARY}
          />
        ) : null}
      </React.Fragment>
    );
  }
}

ReaderModalNavigation.propTypes = {
  Modal: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  Reader: PropTypes.object.isRequired,
  actions: PropTypes.arrayOf(PropTypes.element),
  noSizing: PropTypes.bool,
  drawerItems: PropTypes.arrayOf(PropTypes.element)
};

ReaderModalNavigation.defaultProps = {
  actions: [],
  noSizing: false,
  drawerItems: []
};
