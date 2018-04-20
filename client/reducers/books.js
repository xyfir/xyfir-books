import * as types from 'constants/actions/books';

export default function(state, action) {
  switch (action.type) {
    case types.LOAD_BOOKS:
      return action.books;

    case types.DELETE_BOOKS:
      return state.filter(book => action.ids.indexOf(book.id) == -1);

    case types.ADD_FORMAT:
      return (() => {
        let temp = state.slice(0);

        temp.forEach((book, i) => {
          if (action.id == book.id && book.formats.length > 0) {
            let exists = false;
            action.format = action.format.toLowerCase();

            // Check if user is replacing a format that already exists
            book.formats.forEach(format => {
              if (format.split('.').slice(-1)[0] == action.format) {
                exists = true;
              }
            });

            // If format already exists, state doesn't need to be updated
            if (!exists) {
              // Add a new format based on already existing file name
              let format = book.formats[0].split('.');
              format[format.length - 1] = action.format;

              temp[i].formats.push(format.join('.'));
            }
          }
        });

        return temp;
      }).call();

    case types.DELETE_FORMAT:
      return (() => {
        let temp = state.slice(0);
        action.format = action.format.toLowerCase();

        temp.forEach((book, i) => {
          if (action.id == book.id && book.formats.length > 0) {
            temp[i].formats = book.formats.filter(format => {
              return format.split('.').slice(-1) != action.format;
            });
          }
        });

        return temp;
      }).call();

    case types.UPDATE_BOOK:
      return (() => {
        let temp = state.slice(0);

        temp.forEach((book, i) => {
          if (action.id == book.id) {
            temp[i] = Object.assign({}, book, action.obj);
          }
        });

        return temp;
      }).call();

    default:
      return state;
  }
}
