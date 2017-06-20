import request from 'superagent';
import React from 'react';

// Components
import Overlay from 'components/reader/overlay/Overlay';
import Modal from 'components/reader/modal/Modal';

// Modules
import updateEpubJsPrototype from 'lib/reader/epubjs/update-prototype';
import insertAnnotations from 'lib/reader/annotations/insert';
import updateAnnotations from 'lib/reader/annotations/update';
import highlightNotes from 'lib/reader/notes/highlight';
import swipeListener from 'lib/reader/listeners/swipe';
import clickListener from 'lib/reader/listeners/click';
import emToPixels from 'lib/misc/em-to-pixels';
import unwrap from 'lib/reader/matches/unwrap';

// Constants
import { LIBRARY } from 'constants/config';

// Action creators
import { updateBook } from 'actions/creators/books';
import { save } from 'actions/creators/index';

export default class Reader extends React.Component {

  constructor(props) {
    super(props);

    const id = window.location.hash.split('/')[2];
    
    this.state = {
      book: this.props.data.books.find(b => id == b.id),
      pagesLeft: 0, percent: 0,
      history: {
        items: [], index: -1, ignore: false
      },
      //
      initialize: false, loading: true,
      //
      modal: {
        target: '', show: ''
      },
      highlight: {
        mode: this.props.data.config.reader.defaultHighlightMode,
        index: 0
      }
    },
    this.timers = {};
    
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
    this._initialize = this._initialize.bind(this);
    this._getFilters = this._getFilters.bind(this);
    this._getStyles = this._getStyles.bind(this);
  }

  /**
   * Download book, update annotations, create epub, and start initialization 
   * process.
   */
  componentWillMount() {
    // Build url to .epub file to read
    let url = LIBRARY + 'files/' + this.props.data.account.library + '/';
    let hasEpub = false;
    
    this.state.book.formats.forEach(format => {
      if (format.split('.').slice(-1)[0] == 'epub') {
        hasEpub = true;
        url += format;
      }
    });

    // We can only read epub files
    if (!hasEpub) {
      history.back();
      return;
    }

    const r = this.props.data.config.reader, id = this.state.book.id;
    let book;
    
    // Get bookmarks, notes, last read time
    request
      .get(`../api/books/${id}`)
      .then(res => {
        book = res.body;

        // Update / set book's annotations
        return updateAnnotations(
          this.state.book.annotations, r.annotationsKey
        );
      })
      .then(ans => {
        book.annotations = ans;

        this.setState({ book: Object.assign({}, this.state.book, book) });

        // Update book in app/component/storage
        this.props.dispatch(updateBook(id, book));
        this.props.dispatch(save('books'));

        // Overwrite parts of EPUBJS prototype
        updateEpubJsPrototype();

        return this._getStyles();
      })
      .then(s => {
        // Create EPUBJS reader object
        window.epub = ePub(url, {
          bookKey: id, spreads: true, width: window.innerWidth,
          height: (window.innerHeight - (emToPixels() * 2)),
          styles: {
            fontSize: s.fontSize + 'em',
            padding: `0em ${s.padding}em`,
            lineHeight: s.lineHeight + 'em',
            backgroundColor: s.backgroundColor
          }
        });

        this.setState({ initialize: true });
      })
      .catch(err => history.back());
  }
  
  /**
   * Run _initialize if needed.
   */
  componentDidUpdate() {
    if (this.state.initialize) this._initialize();
  }
  
  /**
   * Update book's percent complete and last read time. Clean up.
   */
  componentWillUnmount() {
    request
      .post(`../api/books/${this.state.book.id}/close`)
      .send({ percentComplete: this.state.percent })
      .end((err, res) => {
        res.body.percent_complete = this.state.percent;
        
        this.props.dispatch(
          updateBook(this.state.book.id, res.body)
        );
        this.props.dispatch(save('books'));
      });
    
    epub.destroy(); window.epub = undefined;
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
   */
  onAddToHistory() {
    if (this.state.history.ignore) {
      const history = Object.assign({}, this.state.history);
      
      history.ignore = false;
      this.setState({ history });
    }
    else {
      const items = this.state.history.items.slice(0);

      if (items.length == 5) items.shift();

      items.push(epub.getCurrentLocationCfi());

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
        return epub.nextPage();
      case 'right':
        return epub.prevPage();
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
        epub.prevPage(); break;
      case 'next page':
        epub.nextPage(); break;
      case 'cycle highlights':
        this.refs.overlay.refs.status._setStatus(
          this.onCycleHighlightMode()
        ); break;
      case 'show book info':
        this.onToggleShow('bookInfo');
        break;
      case 'toggle navbar':
        this.refs.overlay._toggleShow();
    }
  }

  /**
   * Triggered when highlighted text within the book's content is clicked.
   * @param {MouseEvent} event
   * @param {string} type - The type of highlight. 'annotation', 'note'
   * @param {number|string} key - Which highlight was clicked.
   */
  onHighlightClicked(event, type, key) {
    const elements = [];
    let element = event.target;

    // Get all of the clicked element's parents
    while (element) {
      elements.unshift(element);
      element = element.parentNode;
    }
    elements.splice(-1, 1);

    // Pass click to parent element of same type and exit
    for (let el of elements) {
      if (el.classList && el.classList.contains(type)) {
        el.click();
        return;
      }
    }

    // Show item
    this.setState({
      modal: {
        target: key, closeWait: Date.now() + 100,
        show: (type == 'note' ? 'notes' : 'viewAnnotations')
      }
    });
  }
  
  /**
   * Load styles, render book, generate pagination, set initial location, 
   * initialize variables / objects, apply filters and styling, add event 
   * listeners, apply highlights, and get word count.
   */
  _initialize() {
    this.setState({ initialize: false });

    // View annotation or note
    epub.onClick = this.onHighlightClicked;

    epub.renderTo('book')
      .then(() => {
        return this._getStyles();
      })
      .then(s => {
        epub.element.style.backgroundColor = s.backgroundColor;

        // Generate pagination so we can get pages/percent
        return epub.generatePagination();
      })
      .then(pages => {
        // Set initial location
        if (this.state.book.bookmarks.length > 0)
          epub.gotoCfi(this.state.book.bookmarks[0].cfi);
        else
          epub.gotoPercentage(this.state.book.percent_complete / 100);

        // Initialize epub.renderer.selectedRange
        epub.renderer.onSelectionChange();
        
        this.setState({ loading: false });

        return this._getFilters();
      })
      .then(f => {
        this._applyFilters(f);
        this._addEventListeners();
        this._applyStyles();
        this._applyHighlights(this.state.highlight, true);
        this._getWordCount();

        epub.renderer.triggerEvent({ type: 'locationChanged' });
      });
  }
  
  /**
   * Load the reader styles.
   * @returns {Promise} Resolves to styles object.
   */
  _getStyles() {
    const styles = this.props.data.config.reader;

    return new Promise(resolve =>
      localforage.getItem('styling-' + this.state.book.id)
        .then(s =>
          resolve(s ? Object.assign({}, styles, s) : styles)
        )
        .catch(e => resolve(styles))
    );
  }

  /**
   * Load styles and apply them.
   */
  _applyStyles() {
    this._getStyles()
      .then(s => {
        let el = epub.renderer.doc.getElementById('reader-styles');
        let create = false;

        if (!el) {
          el = epub.renderer.doc.createElement('style');
          create = true;
        }
        
        el.innerHTML = `
          * { color: ${s.color} !important; }
          .annotation { background-color: ${s.annotationColor}; }
          .note { background-color: ${s.highlightColor}; }
        `;
        epub.element.style.backgroundColor = s.backgroundColor;

        if (create) {
          el.setAttribute('id', 'reader-styles');
          epub.renderer.doc.head.appendChild(el);
        }
      });
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
   * @returns {Promise} Resolves to the filters object.
   */
  _getFilters() {
    const filters = {
      brightness: 100, warmth: 0, contrast: 100
    };

    return new Promise(resolve =>
      localforage.getItem('filters-' + this.state.book.id)
        .then(f =>
          resolve(f ? Object.assign({}, filters, f) : filters)
        )
        .catch(e => resolve(filters))
    );
  }
  
  /**
   * Add EPUBJS and other event listeners.
   */
  _addEventListeners() {
    // Update pages left in chapter
    // Update percent complete
    epub.on('renderer:locationChanged', cfi => {
      const hasColumns =
        epub.renderer.doc.documentElement.style.width != 'auto';
      
      this.setState({
        pagesLeft: (hasColumns
          ? Math.round(epub.renderer.getRenderedPagesLeft() / 2)
          : epub.renderer.getRenderedPagesLeft()
        ),
        percent: this._getPercentComplete()
      });
    });
    
    // Apply styles
    // Insert annotations / highlight notes
    // Add swipe and click listeners
    epub.on('renderer:chapterDisplayed', () => {
      this._applyStyles();
      this._applyHighlights(this.state.highlight, true);

      const el = epub.renderer.doc.documentElement;

      swipeListener(el, (dir) => this.onSwipe(dir));
      clickListener(el, (action) => this.onClick(action));
    });

    // Add location to history
    epub.on('renderer:chapterUnloaded', () =>
      this.onAddToHistory()
    );
    
    // Regenerate pagination and update percent
    epub.on('renderer:resized', () => {
      clearTimeout(this.timers.resized);
      
      this.timers.resized = setTimeout(() => {
        epub.generatePagination()
          .then(pages =>
            this.setState({ percent: this._getPercentComplete() })
          );
      }, 500);
    });

    const el = epub.renderer.doc.documentElement;

    swipeListener(el, (dir) => this.onSwipe(dir));
    clickListener(el, (action) => this.onClick(action));
  }
  
  /**
   * Calculate the percentage of the book that has been read.
   * @returns {number}
   */
  _getPercentComplete() {
    return Math.round(
      epub.pagination.percentageFromCfi(epub.getCurrentLocationCfi()) * 100
    );
  }

  /**
   * Apply highlights to the book's rendered HTML.
   * @param {object} highlight 
   * @param {boolean} [skipUnwrap=false]
   */
  _applyHighlights(highlight, skipUnwrap = false) {
    // Either annotations or notes can go to none
    if (highlight.mode == 'none' && !skipUnwrap) {
      unwrap('annotation');
      unwrap('note');
    }
    // Notes can only come after none
    else if (highlight.mode == 'notes') {
      highlightNotes(this.state.book.notes);
    }
    // Annotations can come after notes or another annotation set
    else if (highlight.mode == 'annotations') {
      // Can be skipped if 'annotations' default and first load
      if (!skipUnwrap) {
        unwrap('note');
        unwrap('annotation');
      }

      // Ensure book has annotation set
      if (
        this.state.book.annotations &&
        this.state.book.annotations[highlight.index]
      ) {
        insertAnnotations(this.state.book.annotations[highlight.index]);
      }
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
  _getWordCount() {
    // Count and update book's word count
    if (this.state.book.word_count == 0) {
      const files = epub.zip.zip.files;
      const zip = new JSZip();
      let count = 0;

      Object.keys(files).forEach(file => {
        if (file.split('.')[1] != 'html') return;
        
        count += zip
          .utf8decode(files[file]._data.getContent())
          .replace(/(<([^>]+)>)/ig, ' ')
          .split(/\s+/).length;
      });
      
      request
        .put(`../api/books/${this.state.book.id}/word-count`)
        .send({ count })
        .end((err, res) =>
          this._updateBook({ word_count: count })
        );
    }
  }

  render() {
    if (window.epub === undefined) return <div />;
    
    return (
      <div className='reader'>
        <div id='book' />
        
        <Overlay
          ref='overlay'
          parent={this}
        />
        
        <Modal reader={this} />
      </div>
    );
  }

}