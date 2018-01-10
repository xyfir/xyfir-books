import request from 'superagent';
import EPUB from 'epubjs';
import React from 'react';

// !! window.ePub needed for EPUBJS to work
window.ePub = window.EPUBJS = EPUB;

// Components
import Overlay from 'components/reader/overlay/Overlay';
import Modal from 'components/reader/modal/Modal';

// Modules
import insertAnnotations from 'lib/reader/annotations/insert';
import updateAnnotations from 'lib/reader/annotations/update';
import highlightNotes from 'lib/reader/notes/highlight';
import swipeListener from 'lib/reader/listeners/swipe';
import clickListener from 'lib/reader/listeners/click';
import unwrap from 'lib/reader/matches/unwrap';

// Constants
import { XYLIBRARY_URL, XYBOOKS_URL } from 'constants/config';

// Action creators
import { updateBook } from 'actions/books';
import { save } from 'actions/app';

export default class Reader extends React.Component {

  constructor(props) {
    super(props);

    const id = window.location.hash.split('/')[3];

    this.state = {
      book: this.props.data.books.find(b => id == b.id),
      pagesLeft: 0, percent: 0, loading: true,
      history: {
        items: [], index: -1, ignore: false
      },
      modal: {
        target: '', show: ''
      },
      highlight: {
        mode: this.props.data.config.reader.defaultHighlightMode,
        index: 0
      }
    };

    this.onCycleHighlightMode = this.onCycleHighlightMode.bind(this);
    this.onHighlightClicked = this.onHighlightClicked.bind(this);
    this._addEventListeners = this._addEventListeners.bind(this);
    this._applyHighlights = this._applyHighlights.bind(this);
    this._getWordCount = this._getWordCount.bind(this);
    this._applyFilters = this._applyFilters.bind(this);
    this.onToggleShow = this.onToggleShow.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
    this._applyStyles = this._applyStyles.bind(this);
    this._updateBook = this._updateBook.bind(this);
    this._getFilters = this._getFilters.bind(this);
    this._getStyles = this._getStyles.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onSwipe = this.onSwipe.bind(this);

    document.querySelector('body>main').id = '';
  }

  /**
   * Load / initialize book.
   */
  async componentWillMount() {
    const {App} = this.props;

    // Build url to .epub file to read
    let url = `${XYLIBRARY_URL}/files/${this.props.data.account.library}/`;
    let hasEpub = false;

    this.state.book.formats.forEach(format => {
      if (format.split('.').slice(-1)[0] == 'epub') {
        hasEpub = true,
        url += format;
      }
    });

    // We can only read epub files
    if (!hasEpub) return history.back();

    const { id } = this.state.book;
    let bookInfo = {}, epubBlob;

    // Attempt to load epub file, either locally or remotely
    try {
      epubBlob = await localforage.getItem(`book-epub-${id}`);
      if (!epubBlob) throw 'Missing file';
    }
    catch (err) {
      if (!navigator.onLine) {
        App._alert('You do not have that book downloaded for offline use');
        return history.back();
      }

      try {
        const {body} = await request.get(url).responseType('blob');
        epubBlob = body;

        // Save file, no matter if successful
        localforage.setItem(`book-epub-${id}`, epubBlob)
          .then(() => 1)
          .catch(() => 1);
      }
      catch (err) {
        App._alert('Could not download ebook file');
        return history.back();
      }
    }

    // Load extra data (notes, annotations, etc)
    try {
      if (!navigator.onLine) throw 'Offline';

      const res = await request.get(`${XYBOOKS_URL}/api/books/${id}`);
      bookInfo = res.body;

      bookInfo.annotations = await updateAnnotations(
        this.state.book.annotations,
        App.state.account.xyAnnotationsKey
      );
    }
    // Set default values if not available locally
    catch (err) {
      if (!this.state.book.last_read) {
        bookInfo.notes = [],
        bookInfo.last_read = 0,
        bookInfo.bookmarks = [];
      }
      if (!this.state.book.annotations)
        bookInfo.annotations = [];
    }

    // Merge bookInfo with book in states and storage
    this._updateBook(bookInfo);

    // Create EPUBJS book
    window._book = this.book = new EPUB(epubBlob, {});

    this.book.renderTo(window.bookView, {
      height: window.innerHeight + 'px',
      width: window.innerWidth + 'px'
    });

    this.book.ready
      .then(() => {
        return this.book.rendition.display();
      })
      .then(() => {
        // ** Save / load
        return this.book.locations.generate(1000);
      })
      .then(pages => {
        // Set initial location to bookmark
        if (this.state.book.bookmarks.length > 0) {
          this.book.rendition.display(this.state.book.bookmarks[0].cfi);
        }
        // Set initial location to percentage
        else {
          this.book.rendition.display(
            this.book.locations.cfiFromPercentage(
              this.state.book.percent_complete / 100
            )
          );
        }

        return this._getFilters();
      })
      .then(f => {
        this._applyFilters(f);
        this._addEventListeners();
        this._applyStyles();
        this._applyHighlights(this.state.highlight, true);
        this._getWordCount();

        this.setState({ loading: false });
      })
      .catch(err => !console.error(err) && history.back());
  }

  /**
   * Update book's percent complete and last read time. Clean up.
   */
  componentWillUnmount() {
    document.querySelector('body>main').id = 'content';

    if (!this.book) return;

    navigator.onLine && request
      .post(`${XYBOOKS_URL}/api/books/${this.state.book.id}/close`)
      .send({ percentComplete: this.state.percent })
      .end((err, res) => {
        res.body.percent_complete = this.state.percent;

        this.props.dispatch(
          updateBook(this.state.book.id, res.body)
        );
        this.props.dispatch(save('books'));
      });

    this.book.destroy();
    window._book = this.book = undefined;
  }

  /**
   * Cycle through highlight modes.
   */
  onCycleHighlightMode() {
    const highlight = (() => {
      switch (this.state.highlight.mode) {
        // none -> notes
        case 'none':
          return { mode: 'notes' };

        // notes -> first annotation set OR none
        case 'notes':
          if (
            !this.state.book.annotations ||
            !this.state.book.annotations.length
          )
            return { mode: 'none' };
          else
            return { mode: 'annotations', index: 0 };

        // annotations -> next set OR none
        case 'annotations':
          if (this.state.book.annotations[this.state.highlight.index + 1]) {
            return {
              mode: 'annotations',
              index: this.state.highlight.index + 1
            };
          }
          else {
            return { mode: 'none' };
          }
      }
    })();

    this._applyHighlights(highlight);
    this.setState({ highlight });

    return highlight;
  }

  /**
   * Add epub CFI to history.
   * @param {object} location
   */
  onAddToHistory(location) {
    if (this.state.history.ignore) {
      const history = Object.assign({}, this.state.history);

      history.ignore = false;
      this.setState({ history });
    }
    else {
      const items = this.state.history.items.slice(0);

      if (items.length == 20) items.shift();

      items.push(location.start.cfi);

      this.setState({ history: { items, index: -1, ignore: false } });
    }
  }

  /**
   * Open or close a modal.
   * @param {string} show
   * @param {boolean} [closeModal=false]
   */
  onToggleShow(show, closeModal = false) {
    if (closeModal) this.onCloseModal();

    if (!!this.state.show)
      this.setState({ modal: { show: '', target: '' } });
    else
      this.setState({ modal: { show, target: '' } });
  }

  /**
   * Close the open modal.
   */
  onCloseModal() {
    this.setState({ modal: { target: '', show: '' } });
  }

  /**
   * Handle next / previous page on swipes.
   * @param {string} dir - 'left|right'
   */
  onSwipe(dir) {
    switch (dir) {
      case 'left':
        return this.book.rendition.next();
      case 'right':
        return this.book.rendition.prev();
    }
  }

  /**
   * Called when a user clicks or taps a section of the screen that corresponds
   * to an action.
   * @param {string} action
   */
  onClick(action) {
    if (this.state.modal.show) {
      if (Date.now() > this.state.modal.closeWait)
        this.onCloseModal();
      return;
    }

    switch (action) {
      case 'previous page':
        return this.book.rendition.prev();
      case 'next page':
        return this.book.rendition.next();
      case 'cycle highlights':
        return this._overlay._status._setStatus(
          this.onCycleHighlightMode()
        );
      case 'show book info':
        return this.onToggleShow('bookInfo');
      case 'toggle navbar':
        return this._overlay._toggleShow();
    }
  }

  /**
   * Triggered when highlighted text within the book's content is clicked.
   * @param {MessageEvent} event
   * @param {object} event.data
   * @param {boolean} event.data.epubjs
   * @param {string} event.data.type
   * @param {string} event.data.key
   */
  onHighlightClicked(event) {
    if (!event.data.epubjs) return;

    this.setState({
      modal: {
        closeWait: Date.now() + 100,
        target: event.data.key,
        show: event.data.type == 'note' ? 'notes' : 'viewAnnotations'
      }
    });
  }

  /**
   * Load the reader styles.
   * @async
   * @return {object}
   */
  async _getStyles() {
    const s1 = this.props.data.config.reader;

    try {
      const s2 = await localforage.getItem(`styling-${this.state.book.id}`);
      return s2 ? Object.assign({}, s1, s2) : s1;
    }
    catch (err) {
      return s1;
    }
  }

  /**
   * Load styles and apply them.
   * @async
   */
  async _applyStyles() {
    const styles = await this._getStyles();

    this.book.rendition.themes.default({
      'html': {
        'color': `${styles.color} !important`,
        'font-size': `${styles.fontSize}em`,
        'line-height': `${styles.lineHeight}em`,
        'background-color': styles.backgroundColor
      },
      'span.annotation': {
        'background-color': styles.annotationColor,
        'cursor': 'pointer'
      },
      'span.note': {
        'background-color': styles.highlightColor,
        'cursor': 'pointer'
      }
    });
    this.book.rendition.themes.update('default');
  }

  /**
   * Apply CSS filters to the `div.reader` element.
   * @param {object} filters
   */
  _applyFilters(filters) {
    document.querySelector('div.reader').style.filter =
      `brightness(${filters.brightness}%) ` +
      `contrast(${filters.contrast}%) ` +
      `sepia(${filters.warmth}%)`;
  }

  /**
   * Load the filters applied to the book.
   * @async
   * @return {object}
   */
  async _getFilters() {
    const f1 = {
      brightness: 100, warmth: 0, contrast: 100
    };

    try {
      const f2 = await localforage.getItem(`filters-${this.state.book.id}`);
      return f2 ? Object.assign({}, f1, f2) : f1;
    }
    catch (err) {
      return f1;
    }
  }

  /**
   * Add EPUBJS and other event listeners.
   */
  _addEventListeners() {
    // Update pages left in chapter
    // Update percent complete
    // Add location to history
    this.book.rendition.on('relocated', location => {
      this.onAddToHistory(location);

      let pagesLeft =
        this.book.rendition.manager.location[0].totalPages -
        this.book.rendition.manager.location[0].pages[0];
      pagesLeft =
        this.book.rendition.manager.location[0].pages[1]
          ? Math.floor(pagesLeft / 2) : pagesLeft;

      this.setState({
        pagesLeft,
        percent: +location.end.percentage.toFixed(2) * 100
      });
    });

    // Apply styles
    // Insert annotations / highlight notes
    // Add swipe and click listeners
    this.book.rendition.on('rendered', (section, view) => {
      this._applyStyles();
      this._applyHighlights(this.state.highlight, true);

      const [{document}] = this.book.rendition.getContents();

      swipeListener(document, this.book, this.onSwipe);
      clickListener(document, this.book, this.onClick);
    });

    window.addEventListener('message', this.onHighlightClicked);

    const [{document}] = this.book.rendition.getContents();

    swipeListener(document, this.book, this.onSwipe);
    clickListener(document, this.book, this.onClick);
  }

  /**
   * Apply highlights to the book's rendered HTML.
   * @param {object} highlight
   * @param {boolean} [skipUnwrap=false]
   */
  _applyHighlights(highlight, skipUnwrap = false) {
    const {notes, annotations} = this.state.book;
    const [{document}] = this.book.rendition.getContents();

    // Either annotations or notes can go to none
    if (highlight.mode == 'none' && !skipUnwrap) {
      unwrap(document, 'annotation');
      unwrap(document, 'note');
    }
    // Notes can only come after none
    else if (highlight.mode == 'notes') {
      highlightNotes(this.book, notes);
    }
    // Annotations can come after notes or another annotation set
    else if (highlight.mode == 'annotations') {
      // Can be skipped if 'annotations' default and first load
      if (!skipUnwrap) {
        unwrap(document, 'note');
        unwrap(document, 'annotation');
      }

      // Ensure book has annotation set
      if (annotations && annotations[highlight.index])
        insertAnnotations(this.book, annotations[highlight.index]);
    }
  }

  /**
   * Updates the book object in component state, application state, and local
   * storage.
   * @param {object} obj
   */
  _updateBook(obj) {
    this.props.dispatch(updateBook(
      this.state.book.id, obj
    ));
    this.setState({
      book: Object.assign({}, this.state.book, obj)
    });
    this.props.dispatch(save('books'));
  }

  /**
   * Calculates and saves the book's word count if not already calculated.
   */
  async _getWordCount() {
    if (this.state.book.word_count > 0) return;

    let count = 0;

    // Used to render each chapter
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    // Loop through all files in book
    for (let item of this.book.spine.items) {
      // Ignore non-html files
      if (!/html$/.test(item.href.split('.').slice(-1)[0])) continue;

      // Set HTML to frame
      iframe.contentDocument.documentElement.innerHTML =
        await this.book.archive.zip.files[item.href].async('string');

      // Count text, not HTML
      count += iframe.contentDocument.body.innerText.split(/\s+/).length;
    }

    iframe.remove();
  }

  render() {
    return (
      <div className='reader'>
        <div id='bookView' />

        <Overlay
          ref={i => this._overlay = i}
          Reader={this}
        />

        <Modal Reader={this} />
      </div>
    );
  }

}