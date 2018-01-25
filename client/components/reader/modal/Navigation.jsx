import { Toolbar, Button } from 'react-md';
import PropTypes from 'prop-types';
import React from 'react';

export default class ReaderModalNavigation extends React.Component {

  constructor(props) {
    super(props);
  }

  onResize() {
    const {Modal} = this.props;
    Modal.setState({ fullscreen: !Modal.state.fullscreen });
  }

  onClose() {
    const {Modal, Reader} = this.props;

    // For some reason if the user closes while in fullscreen and then
    // reopens and clicks the 'shrink' button the Dialog breaks
    if (Modal.state.canResize)
      Modal.setState({ fullscreen: false }, () => Reader.onCloseModal());
    else
      Reader.onCloseModal();
  }

  render() {
    const {Modal, title} = this.props;
    const actions = this.props.actions.slice();

    if (Modal.state.canResize) {
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

    return (
      <Toolbar
        colored
        actions={actions}
        title={title}
        nav={
          <Button
            icon
            onClick={() => this.onClose()}
            iconChildren='close'
          />
        }
      />
    );
  }

}

ReaderModalNavigation.propTypes = {
  Modal: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  Reader: PropTypes.object.isRequired,
  actions: PropTypes.arrayOf(PropTypes.element)
};

ReaderModalNavigation.defaultProps = {
  actions: []
}