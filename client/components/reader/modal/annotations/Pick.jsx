import AnnotateReact from '@xyfir/annotate-react';
import React from 'react';

const PickAnnotations = ({ Reader }) => {
  const { modal } = Reader.state;

  // All will be same setId
  const setId = +modal.target[0].split('-')[0];
  /** @type {number[]} */
  const itemIds = modal.target.reduce(
    (ids, key) => ids.concat(+key.split('-')[1]),
    []
  );

  return (
    <AnnotateReact.ItemPicker
      items={Reader.state.book.annotations
        .find(set => set.id == setId)
        .items.filter(i => itemIds.indexOf(i.id) > -1)}
      onPick={i =>
        Reader.setState({
          modal: Object.assign({}, modal, {
            closeWait: Date.now() + 100,
            target: `${setId}-${i.id}`
          })
        })
      }
    />
  );
};

PickAnnotations.noFullScreen = true;

export default PickAnnotations;
