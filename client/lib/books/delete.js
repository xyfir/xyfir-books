import request from 'superagent';

// Action creators
import { deleteBooks } from 'actions/creators/books';

/**
 * Prompts the user to confirm that they want to delete the book(s) and then 
 * deletes the book(s).
 * @param {number[]} books
 * @param {function} dispatch
 * @return {Promise} Resolves to a boolean that is true if the books were 
 * deleted.
 */
export default function(books, dispatch) {

  return new Promise(resolve => {
    if (!navigator.onLine) {
      swal(
        'No Internet Connection',
        'This action requires an internet connection',
        'error'
      );
      return resolve(false);
    }
    
    swal({
      title: 'Are you sure?',
      text: `Are you sure you want to delete (${books.length}) book(s)?`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DD6B55',
      confirmButtonText: 'Delete'
    }, () =>
      request
        .delete('../api/books')
        .send({ ids: books.join(',') })
        .end((err, res) => {
          if (err || res.body.error) {
            swal('Error', 'Could not delete book(s)', 'error');
            resolve(false);
          }
          else {
            dispatch(deleteBooks(books));
            resolve(true);
          }
        })
    );
  });

}