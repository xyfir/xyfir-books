import React from 'react';

// Components
import Create from 'components/reader/modal/notes/Create';
import List from 'components/reader/modal/notes/List';
import View from 'components/reader/modal/notes/View';

export default class Notes extends React.Component {
  constructor(props) {
    super(props);

    this.state = { note: props.Reader.state.modal.target || -1 };
    this.state.view =
      this.state.note > -1
        ? 'view'
        : props.Reader.state.book.notes.length
          ? 'list'
          : 'create';
  }

  render() {
    const props = Object.assign({}, this.props, { Notes: this });

    switch (this.state.view) {
      case 'create':
        return <Create {...props} />;
      case 'list':
        return <List {...props} />;
      case 'view':
        return <View {...props} />;
    }
  }
}
