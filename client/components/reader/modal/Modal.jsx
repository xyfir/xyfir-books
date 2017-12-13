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

  /**
   * Close the fullscreen modal.
   */
  onFullscreenClose() {
    if (this.state.canResize) {
      // For some reason if the user closes while in fullscreen and then
      // reopens and clicks the 'shrink' button the Dialog breaks
      this.setState(
        { fullscreen: false }, () => this.props.Reader.onCloseModal()
      );
    }
    else {
      this.props.Reader.onCloseModal();
    }
  }

  /**
   * Toggle fullscreen.
   */
  onResize() {
    this.setState({ fullscreen: !this.state.fullscreen });
  }

  render() {
    const {show} = this.props.Reader.state.modal;
    
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
          return null;
      }
    })();

    if (!view) return null;

    const { forceFullscreen, noFullscreen } = view.type;
    
    const canResize =
      this.state.canResize &&
      !forceFullscreen &&
      !noFullscreen;
    
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
          'reader-dialog' + (noFullscreen ? ' transparent' : '')
        }
        aria-label='reader-modal'
        focusOnMount={false}
        contentClassName='md-dialog-content--padded'
      >
        {canResize ? (
          <Button
            floating fixed primary
            tooltipPosition='right'
            fixedPosition='bl'
            tooltipLabel={fullscreen ? 'Shrink' : 'Full Screen'}
            iconChildren={fullscreen ? 'fullscreen_exit' : 'fullscreen'}
            onClick={() => this.onResize()}
          />
        ) : null}

        {fullscreen ? (
          <Button
            floating fixed primary
            tooltipPosition='left'
            fixedPosition='br'
            tooltipLabel='Close'
            iconChildren='close'
            onClick={() => this.onFullscreenClose()}
          />
        ) : null}

        {view}
      </DialogContainer>
    );
  }

}