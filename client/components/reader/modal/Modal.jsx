import { DialogContainer } from 'react-md';
import React from 'react';

// Components
import ManageAnnotations from 'components/reader/modal/annotations/Manage';
import SearchBookContent from 'components/reader/modal/Search';
import PickAnnotations from 'components/reader/modal/annotations/Pick';
import ViewAnnotations from 'components/reader/modal/annotations/View';
import TableOfContents from 'components/reader/modal/TableOfContents';
import BookStyling from 'components/reader/modal/BookStyling';
import Bookmarks from 'components/reader/modal/Bookmarks';
import BookInfo from 'components/reader/modal/BookInfo';
import Filters from 'components/reader/modal/Filters';
import Notes from 'components/reader/modal/notes/Notes';

const IGNORE = {
  ignore: true,
  type: {
    forceFullscreen: false,
    noFullscreen: false
  }
};

export default class ReaderModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fullscreen: window.innerHeight > window.innerWidth,
      canResize: window.innerHeight < window.innerWidth
    };
  }

  render() {
    const { modal } = this.props.Reader.state;

    const view = (() => {
      const props = Object.assign({}, this.props, { Modal: this });

      switch (modal.show) {
        case 'manageAnnotations':
          return <ManageAnnotations {...props} />;
        case 'viewAnnotations':
          return Array.isArray(modal.target) ? (
            <PickAnnotations {...props} />
          ) : (
            <ViewAnnotations {...props} />
          );
        case 'bookStyling':
          return <BookStyling {...props} />;
        case 'bookmarks':
          return <Bookmarks {...props} />;
        case 'bookInfo':
          return <BookInfo {...props} />;
        case 'filters':
          return <Filters {...props} />;
        case 'search':
          return <SearchBookContent {...props} />;
        case 'notes':
          return <Notes {...props} />;
        case 'toc':
          return <TableOfContents {...props} />;
        default:
          return IGNORE;
      }
    })();

    const { forceFullscreen, noFullscreen } = view.type;

    const fullscreen = noFullscreen
      ? false
      : forceFullscreen || this.state.fullscreen;

    return (
      <DialogContainer
        id="reader-dialog"
        onHide={() => this.props.Reader.onCloseModal()}
        visible={!!modal.show}
        fullPage={fullscreen}
        className={
          'reader-dialog container' +
          (noFullscreen ? ' no-fullscreen transparent' : '')
        }
        aria-label="reader-modal"
        focusOnMount={false}
        autopadContent={false}
        contentClassName="reader-dialog content"
      >
        {view.ignore ? null : view}
      </DialogContainer>
    );
  }
}
