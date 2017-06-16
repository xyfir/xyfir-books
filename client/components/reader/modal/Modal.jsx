import React from 'react';

// react-md
import Button from 'react-md/lib/Buttons/Button';
import Dialog from 'react-md/lib/Dialogs';

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

  /**
   * Close the fullscreen modal.
   */
  onFullscreenClose() {
    if (this.state.canResize) {
      // For some reason if the user closes while in fullscreen and then
      // reopens and clicks the 'shrink' button the Dialog breaks
      this.setState(
        { fullscreen: false }, () => this.props.reader.onCloseModal()
      );
    }
    else {
      this.props.reader.onCloseModal();
    }
  }

  /**
   * Toggle fullscreen.
   */
  onResize() {
    this.setState({ fullscreen: !this.state.fullscreen });
  }

  render() {
    const show = this.props.reader.state.modal.show;
    
    const view = (() => {
      switch (show) {
        case 'manageAnnotations':
          return <ManageAnnotations {...this.props} />
        case 'viewAnnotations':
          return <ViewAnnotations {...this.props} />
        case 'bookStyling':
          return <BookStyling {...this.props} />
        case 'bookmarks':
          return <Bookmarks {...this.props} />
        case 'bookInfo':
          return <BookInfo {...this.props} />
        case 'filters':
          return <Filters {...this.props} />
        case 'notes':
          return <Notes {...this.props} />
        case 'toc':
          return <TableOfContents {...this.props} />
        default:
          return <div />;
      }
    })();

    const { forceFullscreen, noFullscreen } = view.type;
    
    const canResize =
      this.state.canResize &&
      !forceFullscreen &&
      !noFullscreen;
    
    const fullscreen = noFullscreen ?
      false :
      forceFullscreen || this.state.fullscreen;

    return (
      <Dialog
        id='reader-dialog'
        onHide={() => this.props.reader.onCloseModal()}
        visible={!!show}
        fullPage={fullscreen}
        className={
          'reader-dialog' + (noFullscreen ? ' transparent' : '')
        }
        contentClassName='md-dialog-content--padded'
      >
        {canResize ? (
          <Button
            floating fixed primary
            tooltipPosition='right'
            fixedPosition='bl'
            tooltipLabel={fullscreen ? 'Shrink' : 'Full Screen'}
            onClick={() => this.onResize()}
          >{
            fullscreen ? 'fullscreen_exit' : 'fullscreen'
          }</Button>
        ) : null}

        {fullscreen ? (
          <Button
            floating fixed primary
            tooltipPosition='left'
            fixedPosition='br'
            tooltipLabel='Close'
            onClick={() => this.onFullscreenClose()}
          >close</Button>
        ) : null}

        {view}
      </Dialog>
    );
  }

}