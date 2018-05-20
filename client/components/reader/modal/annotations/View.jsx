import AnnotateReact from '@xyfir/annotate-react';
import React from 'react';

// Modules
import openWindow from 'lib/util/open-window';

export default class ViewAnnotations extends React.Component {
  constructor(props) {
    super(props);

    const [setId, itemId] = props.Reader.state.modal.target.split('-');
    const annotations = props.Reader.state.book.annotations
      .find(set => set.id == setId)
      .items.find(item => item.id == itemId).annotations;

    this.state = { annotations };
  }

  render() {
    const { Reader } = this.props;

    return (
      <AnnotateReact.ViewAnnotations
        annotations={this.state.annotations}
        onGoToLink={openWindow}
        onClose={() => Reader.onCloseModal()}
        book={Reader.state.book}
      />
    );
  }
}

ViewAnnotations.forceFullscreen = true;
