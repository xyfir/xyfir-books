import { Button, DialogContainer } from 'react-md';
import React from 'react';

// Components
import ManageAnnotations from 'components/reader/modal/annotations/Manage';
import ViewAnnotations from 'components/reader/modal/annotations/View';
import TableOfContents from 'components/reader/modal/TableOfContents';
import BookStyling from 'components/reader/modal/BookStyling';
import Bookmarks from 'components/reader/modal/Bookmarks';
import BookInfo from 'components/reader/modal/BookInfo';
import Filters from 'components/reader/modal/Filters';
import Notes from 'components/reader/modal/notes/Notes';

export default class ReaderModal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      fullscreen: window.innerHeight > window.innerWidth,
      canResize: window.innerHeight < window.innerWidth
    };
  }

  render() {
    const {show} = this.props.Reader.state.modal;

    const view = (() => {
      const props = Object.assign({}, this.props, { Modal: this });

      switch (show) {
        case 'manageAnnotations':
          return <ManageAnnotations {...props} />
        case 'viewAnnotations':
          return <ViewAnnotations {...props} />
        case 'bookStyling':
          return <BookStyling {...props} />
        case 'bookmarks':
          return <Bookmarks {...props} />
        case 'bookInfo':
          return <BookInfo {...props} />
        case 'filters':
          return <Filters {...props} />
        case 'notes':
          return <Notes {...props} />
        case 'toc':
          return <TableOfContents {...props} />
        default:
          return null;
      }
    })();

    if (!view) return null;

    const { forceFullscreen, noFullscreen } = view.type;

    const fullscreen = noFullscreen ?
      false :
      forceFullscreen || this.state.fullscreen;

    return (
      <DialogContainer
        id='reader-dialog'
        onHide={() => this.props.Reader.onCloseModal()}
        visible={true}
        fullPage={fullscreen}
        className={
          'reader-dialog container' + (noFullscreen ? ' transparent' : '')
        }
        aria-label='reader-modal'
        focusOnMount={false}
        autopadContent={false}
        contentClassName='reader-dialog content'
      >{view}</DialogContainer>
    );
  }

}