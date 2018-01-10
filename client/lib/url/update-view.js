// Action creators
import { changeView } from 'actions/app';

// Constants
import * as VIEWS from 'constants/views';

/**
 * Updates `App.state.view` based on the current url hash route.
 * @param {object} store
 * @return {string} The new value for `App.state.view`
 */
export default function(store) {

  const state = store.getState();
  const hash = location.hash
    .substr(2)
    .split('?')[0]
    .split('/');

  // Update state to reflect hash
  let view = (() => {
    if (hash[0] == 'account') {
      if (hash[1] == 'purchase') {
        switch (hash[2]) {
          case 'subscription':
            return VIEWS.PURCHASE_SUBSCRIPTION;
          case 'xyannotations':
            return VIEWS.XYANNOTATIONS_PURCHASE;
          case 'extend-subscription':
            return VIEWS.EXTEND_SUBSCRIPTION;
          case 'increase-size-limit':
            return VIEWS.INCREASE_SIZE_LIMIT;
        }
      }
      else {
        return VIEWS.ACCOUNT;
      }
    }
    else if (hash[0] == 'library') {
      switch (hash[1]) {
        case 'download':
          return VIEWS.LIBRARY_DOWNLOAD;
        case 'upload':
          return VIEWS.LIBRARY_UPLOAD;
        case 'info':
          return VIEWS.LIBRARY_INFO;
      }
    }
    else if (hash[0] == 'books') {
      if (hash[1] == 'list') {
        switch (hash[2]) {
          case 'tags':
            return VIEWS.LIST_TAGS;
          case 'authors':
            return VIEWS.LIST_AUTHORS;
          case 'author-sort':
            return VIEWS.LIST_AUTHOR_SORT;
          case 'series':
            return VIEWS.LIST_SERIES;
          case 'ratings':
            return VIEWS.LIST_RATINGS;
          default:
            return VIEWS.LIST_BOOKS;
        }
      }
      else {
        switch (hash[1]) {
          case 'recently-opened':
            return VIEWS.RECENTLY_OPENED;
          case 'add-format':
            return VIEWS.ADD_FORMAT;
          case 'bulk-edit':
            return VIEWS.BULK_EDIT;
          case 'manage':
            return VIEWS.MANAGE_BOOK;
          case 'read':
            return VIEWS.READ_BOOK;
          case 'upload':
            return VIEWS.UPLOAD_BOOKS;
        }
      }
    }
    else if (hash[0] == 'settings') {
      switch (hash[1]) {
        case 'book-list':
          return VIEWS.BOOK_LIST_SETTINGS;
        case 'general':
          return VIEWS.GENERAL_SETTINGS;
        case 'reader':
          return VIEWS.READER_SETTINGS;
      }
    }
  })();

  if (!view) view = VIEWS.RECENTLY_OPENED;

  store.dispatch(changeView(view));
  return view;

}