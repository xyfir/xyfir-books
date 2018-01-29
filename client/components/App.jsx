import 'babel-polyfill';

import localForage from 'localforage';
import { render } from 'react-dom';
import request from 'superagent';
import React from 'react';

// Redux store / reducers
import { createStore } from 'redux';
import reducers from 'reducers/app';

// Components
import Navigation from 'components/app/Navigation';
import Settings from 'components/settings/Settings';
import Account from 'components/account/Account';
import Library from 'components/library/Library';
import Loading from 'components/app/Loading';
import Books from 'components/books/Books';
import Alert from 'components/app/Alert';

// Modules
import loadBooksFromApi from 'lib/books/load-from-api';
import parseQuery from 'lib/url/parse-query-string';
import updateView from 'lib/url/update-view';

// Constants
import {
  XYACCOUNTS_URL, LOG_STATE, ENVIRONMENT, XYBOOKS_URL
} from 'constants/config';
import { INITIALIZE_STATE } from 'constants/actions/app';
import { READ_BOOK } from 'constants/views';
import initialState from 'constants/initial-state';

// Actions
import { save, setState } from 'actions/app';

// Globals
window.localforage = localForage;

localforage.config({
  driver: [localforage.INDEXEDDB, localforage.WEBSQL],
  name: 'XyfirBooks'
});

class App extends React.Component {

  constructor(props) {
    super(props);

    this.store = createStore(reducers);

    this._alert = this._alert.bind(this);

    this.store.subscribe(() => {
      const state = this.store.getState();

      this.setState(state);

      if (LOG_STATE) console.log(state);

      if (state.save.length) {
        state.save.forEach(s => localforage.setItem(s, state[s]));
        this.store.dispatch(save([]));
      }
    });

    // Update state.view when url hash changes
    // Update state according to url hash
    window.onhashchange = () => {
      // Force old hash route format to new one
      // `#${route}` -> `#/${route}`
      if (location.hash.indexOf('#/') != 0)
        return location.hash = '#/' + location.hash.substr(1);
      updateView(this.store);
    };

    // setTimeout(() => this._loadAd(), 120000);
    setTimeout(() => this._loadAd(), 3000);
  }

  async componentWillMount() {
    const q = parseQuery();

    if (q.accessToken) localStorage.accessToken = q.accessToken;

    let token = localStorage.accessToken || '';

    // Save referral
    if (q.r) localStorage.url = location.href;

    // Attempt to login using XID/AUTH or skip to initialize()
    if (q.xid && q.auth) {
      const _q = parseQuery(localStorage.url || '');

      if (_q.r) {
        const [type, value] = _q.r.split('~');
        const referral = {
          type, [type]: value, data: _q
        };

        delete referral.data.r, delete localStorage.url;

        q.referral = referral;
      }

      try {
        const res = await request
          .post(`${XYBOOKS_URL}/api/account/login`)
          .send(q);

        if (res.body.error) throw res.body;

        token = localStorage.accessToken = res.body.accessToken,
        window.LOGGED_IN = true;
      }
      catch (err) {
        return location.replace(`${XYACCOUNTS_URL}/#/login/service/14`);
      }
    }
    // Access token is required
    else if (navigator.onLine && !token && ENVIRONMENT != 'dev') {
      return location.replace(`${XYACCOUNTS_URL}/#/login/service/14`);
    }

    const state = Object.assign({}, initialState);

    // Pull data from local storage
    state.loading = false,
    state.account = await localforage.getItem('account') || state.account,
    state.config = await localforage.getItem('config') || state.config,
    state.books = await localforage.getItem('books') || state.books;

    // Set theme
    document.body.className = 'theme-' + state.config.general.theme;

    // Push initial state to store
    this.store.dispatch({ type: INITIALIZE_STATE, state });

    // Set state.view based on current url hash
    updateView(this.store);

    // Load new data from API
    if (!navigator.onLine) return;

    let account;

    request
      .get(`${XYBOOKS_URL}/api/account`)
      .query({ token })
      .then(res => {
        // User not logged in
        if (!res.body.library)
          return location.replace(`${XYACCOUNTS_URL}/#/login/service/14`);

        account = res.body;

        return loadBooksFromApi(account.library);
      })
      .then(books => {
        this.store.dispatch(setState({ account, books }));
        this.store.dispatch(save(['account', 'books']));

        location.hash = location.hash.split('?')[0];
      })
      // Only the HTTP request will throw an error
      .catch(err => location.replace(`${XYACCOUNTS_URL}/#/login/service/14`));
  }

  /**
   * Creates a 'toast' for react-md Snackbar component.
   * @param {string} text
   * @param {string|object} [action=close]
   * @param {boolean} [autohide=true]
   */
  _alert(text, action = 'close', autohide = true) {
    this._Alert._alert(text, action, autohide);
  }

  _loadAd() {
    // Only display if user is not premium
    if (this.state.account.subscription > Date.now()) return;

    request
      .get(`${XYBOOKS_URL}/api/ad`)
      .end((err, res) => {
        if (err || res.body.error) return;

        const {ad} = res.body;

        this._alert(
          `(Ad) ${ad.normalText.title}: ${ad.normalText.description}`,
          'close', false
        );
        setTimeout(() => this._loadAd(), 300000);
      });
  }

  render() {
    if (!this.state || this.state.loading) return <Loading />

    const view = (() => {
      const props = {
        App: this, // eventually replace other props with this
        data: this.state, dispatch: this.store.dispatch, alert: this._alert
      };

      switch (this.state.view.split('/')[0]) {
        case 'SETTINGS': return <Settings {...props} />
        case 'ACCOUNT': return <Account {...props} />
        case 'LIBRARY': return <Library {...props} />
        case 'BOOKS': return <Books {...props} />
      }
    })();

    return (
      <div className='xyfir-books'>
        <Navigation App={this} />

        <div className={
          `main ${this.state.view != READ_BOOK ? 'md-toolbar-relative' : ''}`
        }>{view}</div>

        <Alert ref={i => this._Alert = i} />
      </div>
    );
  }

}

// Redirect Cordova users going through login process back to local file with
// access token
if (!window.cordova) {
  document.addEventListener('deviceready', () => {
    const interval = setInterval(() => {
      if (!window.LOGGED_IN) return;

      clearInterval(interval);

      // !! Must be window.open, location.* doesn't work
      window.open(
        `${window.cordova.file.applicationDirectory}www/index.html` +
        `#/?accessToken=${localStorage.accessToken}`
      );
    }, 25);
  }, false);
}

render(<App />, window.content);