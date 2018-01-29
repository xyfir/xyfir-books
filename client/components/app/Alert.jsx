import { Snackbar } from 'react-md';
import React from 'react';

export default class AppAlert extends React.Component {

  constructor(props) {
    super(props);

    this.state = { toasts: [] };
  }

  /**
   * Remove first element from toasts array.
   */
  onDismissAlert() {
    const [, ...toasts] = this.state.toasts;
    this.setState({ toasts });
  }

  /**
   * Creates a 'toast' for react-md Snackbar component.
   * @param {string} text
   * @param {string|object} [action=close]
   * @param {boolean} [autohide=true]
   */
  _alert(text, action = 'close', autohide = true) {
    this.setState({
      toasts: this.state.toasts.concat([{ text, action, autohide }])
    });
  }

  render() {
    const {toasts} = this.state;

    return (
      <Snackbar
        toasts={toasts}
        autohide={toasts.length && toasts[0].autohide}
        onDismiss={() => this.onDismissAlert()}
      />
    );
  }

}