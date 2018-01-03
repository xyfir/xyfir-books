import request from 'superagent';
import swal from 'sweetalert';

// Action creators
import { deleteBooks } from 'actions/creators/books';

// Constants
import { XYBOOKS_URL } from 'constants/config';

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
      icon: 'warning',
      buttons: true
    })
    .then(() => request
      .delete(`${XYBOOKS_URL}/api/books`)
      .send({ ids: books.join(',') })
    )
    .then(res => {
      if (res.body.error) {
        swal('Error', 'Could not delete book(s)', 'error');
        resolve(false);
      }
      else {
        dispatch(deleteBooks(books));
        resolve(true);
      }
    });
  });

}