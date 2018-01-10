// Constants
import * as readerThemes from 'constants/reader-themes';
import { RECENTLY_OPENED } from 'constants/views';

export default {
  save: [],
  view: RECENTLY_OPENED,
  books: [],
  config: {
    general: {
      theme: 'light', matchThemes: true
    },
    bookList: {
      view: 'compact',
      table: {
        columns: [
          'title', 'authors', 'series', 'added', 'rating'
        ],
        defaultSort: {
          column: 'title', asc: true
        }
      }
    },
    reader: Object.assign({}, readerThemes.LIGHT, {
      fontSize: 1.2, lineHeight: 1.4, defaultHighlightMode: 'none'
    })
  },
  search: {
    query: '', page: 1
  },
  account: {
    uid: 0, email: '', subscription: 0, library: '', librarySizeLimit: 1,
    referral: {}, xyAnnotationsKey: ''
  },
  loading: true
};