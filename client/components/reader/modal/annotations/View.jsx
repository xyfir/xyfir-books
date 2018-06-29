import AnnotateReact from '@xyfir/annotate-react';
import React from 'react';

// Modules
import openWindow from 'lib/util/open-window';

const ViewAnnotations = ({ Reader }) => {
  const { modal } = Reader.state;

  const [setId, itemId] = modal.target.split('-');
  const annotations = Reader.state.book.annotations
    .find(set => set.id == setId)
    .items.find(item => item.id == itemId).annotations;

  return (
    <AnnotateReact.ViewAnnotations
      annotations={annotations}
      onGoToLink={openWindow}
      onClose={() => Reader.onCloseModal()}
      book={Reader.state.book}
    />
  );
};

ViewAnnotations.forceFullscreen = true;

export default ViewAnnotations;
