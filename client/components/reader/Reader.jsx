import React from 'react';

// Components
import Overlay from './Overlay';
import Modal from './Modal';

// Modules
import updateEpubJsPrototype from 'lib/reader/epubjs/update-prototype';
import insertAnnotations from 'lib/reader/annotations/insert';
import updateAnnotations from 'lib/reader/annotations/update';
import highlightNotes from 'lib/reader/notes/highlight';
import swipeListener from 'lib/reader/listeners/swipe';
import clickListener from 'lib/reader/listeners/click';
import emToPixels from 'lib/misc/em-to-pixels';
import request from 'lib/request/index';
import unwrap from 'lib/reader/matches/unwrap';

// Constants
import { URL, LIBRARY } from 'constants/config';

// Action creators
import { updateBook } from 'actions/creators/books';
import { save } from 'actions/creators/index';

export default class Reader extends React.Component {

  constructor(props) {
    super(props);

    const id = window.location.hash.split('/')[2];

    this.state = {
      book: this.props.data.books.find(b => id == b.id),
      pagesLeft: 0, percent: 0, history: {
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
    };
    this.timers = {};

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
    
    // Get bookmarks, notes, last read time
    request(`${URL}api/books/${id}`, (res) => {
      const r = this.props.data.config.reader;

      // Update / set book's annotations
      updateAnnotations(this.state.book.annotations, r.annotationsKey)
        .then(ans => {
          res.annotations = ans;

          this.setState({
            book: Object.assign({}, this.state.book, res)
          }, () => {
            // Update book in app/component/storage
            this.props.dispatch(updateBook(id, res));
            this.props.dispatch(save('books'));

            // Overwrite parts of EPUBJS prototype
            updateEpubJsPrototype();

            this._getStyles(s => {
              // Create EPUB.JS reader object
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
            });
          });
        });
    });
    
    this.onCycleHighlightMode = this.onCycleHighlightMode.bind(this);
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
  
  componentDidUpdate() {
    if (this.state.initialize) this._initialize();
  }
  
  componentWillUnmount() {
    // Update book's percent complete and last read time
    request({
      url: URL + 'api/books/' + this.state.book.id + '/close',
      data: { percentComplete: this.state.percent },
      method: 'POST', success: (res) => {
        res.percent_complete = this.state.percent;
        
        this.props.dispatch(updateBook(
          this.state.book.id, res
        ));
        this.props.dispatch(save('books'));
      }
    });
    
    epub.destroy(); window.epub = undefined;
  }

  onCycleHighlightMode() {
    let highlight = {};

    switch (this.state.highlight.mode) {
      // none -> notes
      case 'none':
        highlight = { mode: 'notes' };
        break;
      
      // notes -> first annotation set OR none
      case 'notes':
        if (!this.state.book.annotations || !this.state.book.annotations.length)
          highlight = { mode: 'none' };
        else
          highlight = { mode: 'annotations', index: 0 };
        break;

      // annotations -> next set OR none
      case 'annotations':
        if (this.state.book.annotations[this.state.highlight.index + 1]) {
          highlight = {
            mode: 'annotations',
            index: this.state.highlight.index + 1
          };
        }
        else {
          highlight = { mode: 'none' };
        }
    }

    this._applyHighlights(highlight);

    this.setState({ highlight });
    return highlight;
  }

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

      this.setState({ history: {
        items, index: -1, ignore: false
      } });
    }
  }
  
  onToggleShow(show, closeModal, fn) {
    if (closeModal) this.onCloseModal();
    
    if (!!this.state.show)
      this.setState({ modal: { show: '', target: '' } });
    else
      this.setState({ modal: { show, target: '' } }, fn);
  }
  
  onCloseModal() {
    this.setState({ modal: { target: '', show: '' } });
  }

  onSwipe(dir) {
    switch (dir) {
      case 'left':
        epub.nextPage(); break;
      case 'right':
        epub.prevPage();
    }
  }

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
        this.refs.overlay._toggleShowNavbars();
    }
  }
  
  _initialize() {
    this.setState({ initialize: false });

    // View annotation or note
    epub.onClick = (type, key) => {
      this.setState({ modal: {
        target: key, show: (type == 'note' ? 'notes' : type),
        closeWait: Date.now() + 100
      }});
    };

    this._getStyles(s => {
      epub.element.style.backgroundColor = s.backgroundColor;
    });

    // Render ebook to pages
    epub.renderTo('book')
      .then(() => {
        return epub.generatePagination();
      })
      // Generate pagination so we can get pages/percent
      .then(pages => {
        // Set initial location
        if (this.state.book.bookmarks.length > 0) {
          epub.gotoCfi(
            this.state.book.bookmarks[0].cfi
          );
        }
        else {
          epub.gotoPercentage(
            this.state.book.percent_complete / 100
          );
        }

        // Initialize epub.renderer.selectedRange
        epub.renderer.onSelectionChange();
        
        this.setState({ loading: false });

        this._getFilters(f => this._applyFilters(f));
        
        this._applyStyles();
        this._addEventListeners();
        this._applyHighlights(this.state.highlight, true);
        this._getWordCount();
      });
  }
  
  _getStyles(fn) {
    const styles = this.props.data.config.reader;

    localforage.getItem('styling-' + this.state.book.id)
      .then(s => {
        if (!s)
          fn(styles);
        else
          fn(Object.assign({}, styles, s));
      })
      .catch(e => fn(styles));
  }

  _applyStyles() {
    this._getStyles(s => {
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

  _applyFilters(filters) {
    document.querySelector('div.reader').style.filter
      = `brightness(${filters.brightness}%) `
      + `contrast(${filters.contrast}%) `
      + `sepia(${filters.warmth}%)`;
  }

  _getFilters(fn) {
    const filters = {
      brightness: 100, warmth: 0, contrast: 100
    };

    localforage.getItem('filters-' + this.state.book.id)
      .then(f => {
        if (!f)
          fn(filters);
        else
          fn(Object.assign({}, filters, f));
      })
      .catch(e => fn(filters));
  }
  
  _addEventListeners() {
    // Update pages left in chapter
    // Update percent complete
    epub.on('renderer:locationChanged', (cfi) => {
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
    epub.on('renderer:chapterUnloaded', () => {
      this.onAddToHistory();
    });
    
    // Regenerate pagination and update percent
    epub.on('renderer:resized', () => {
      clearTimeout(this.timers.resized);
      
      this.timers.resized = setTimeout(() => {
        epub.generatePagination()
          .then(pages => {
            this.setState({
              percent: this._getPercentComplete()
            });
          });
      }, 500);
    });

    const el = epub.renderer.doc.documentElement;

    swipeListener(el, (dir) => this.onSwipe(dir));
    clickListener(el, (action) => this.onClick(action));
  }
  
  _getPercentComplete() {
    return Math.round(
      epub.pagination.percentageFromCfi(
        epub.getCurrentLocationCfi()
      ) * 100
    );
  }

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
    // Annotations can only come after notes
    else if (highlight.mode == 'annotations') {
      // Can be skipped if 'annotations' default and first load
      if (!skipUnwrap) unwrap('note');

      // Ensure book has annotation set
      if (
        this.state.book.annotations &&
        this.state.book.annotations[highlight.index]
      ) {
        insertAnnotations(this.state.book.annotations[highlight.index]);
      }
    }
  }
  
  _updateBook(obj) {
    this.props.dispatch(updateBook(
      this.state.book.id, obj
    ));
    this.setState({
      book: Object.assign({}, this.state.book, obj)
    });
    this.props.dispatch(save('books'));
  }

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
      
      request({
        url: `${URL}api/books/${this.state.book.id}/word-count`,
        method: 'PUT', data: { count }, success: (res) => {
          this._updateBook({ word_count: count });
        }
      });
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
        
        <Modal parent={this} />
      </div>
    );
  }

}