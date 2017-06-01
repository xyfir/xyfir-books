import localForage from 'localforage';
import SweetAlert from 'sweetalert';
import { render } from 'react-dom';
import request from 'superagent';
import React from 'react';
import JSZip from 'jszip';

// Redux store / reducers
import { createStore } from 'redux';
import reducers from 'reducers/index';

// react-md
import Subheader from 'react-md/lib/Subheaders';
import ListItem from 'react-md/lib/Lists/ListItem';
import Snackbar from 'react-md/lib/Snackbars';
import Toolbar from 'react-md/lib/Toolbars';
import Divider from 'react-md/lib/Dividers';
import Drawer from 'react-md/lib/Drawers';
import Button from 'react-md/lib/Buttons/Button';

// Components
import Settings from 'components/settings/Index';
import Account from 'components/account/Index';
import Library from 'components/library/Index';
import Books from 'components/books/Index';

// Modules
import loadBooksFromApi from 'lib/books/load-from-api';
import parseQuery from 'lib/url/parse-hash-query';
import updateView from 'lib/url/update-view';

// Constants
import { XACC, LOG_STATE, ENVIRONMENT } from 'constants/config';
import { INITIALIZE_STATE } from 'actions/types/index';
import initialState from 'constants/initial-state';

// Action creators
import { save } from 'actions/creators/index';

const store = createStore(reducers);

// Globals
window.localforage = localForage,
window.JSZip = JSZip,
window.swal = SweetAlert;

localforage.config({
  driver: [localforage.INDEXEDDB, localforage.WEBSQL],
  name: 'XyfirBooks'
});

class App extends React.Component {

  constructor(props) {
    super(props);
    
    this._addListeners = this._addListeners.bind(this);
    this._initialize2 = this._initialize2.bind(this);
    this._initialize = this._initialize.bind(this);
    this._alert = this._alert.bind(this);
    
    this._addListeners();
  }

  componentWillMount() {
    const q = parseQuery();

    // PhoneGap app opens to vynote.com/workspace/#?phonegap=1
    if (q.phonegap) {
      localStorage.setItem('isPhoneGap', 'true');
      location.hash = '';
      this._initialize();
    }
    // Attempt to login using XID/AUTH or skip to initialize()
    else if (q.xid && q.auth) {
      q.affiliate = localStorage.getItem('affiliate') || '';
      q.referral = localStorage.getItem('referral') || '';
      
      request
        .post('../api/account/login')
        .send(q)
        .end((err, res) => {
          if (err || res.body.error) {
            location.replace(XACC + 'login/service/14');
          }
          else {
            localStorage.accessToken = res.body.accessToken;
            this._initialize();
            location.hash = location.hash.split('?')[0];
          }
        });
    }
    else {
      this._initialize();
    }
  }

  /**
   * Remove first element from toasts array.
   */
  onDismissAlert() {
    const [, ...toasts] = this.state.toasts;
    this.setState({ toasts });
  }

  /**
   * Delete access token and redirect to logout.
   */
  onLogout() {
    delete localStorage.accessToken;
    location.href = '../api/account/logout';
  }

  /**
   * Creates a 'toast' for react-md Snackbar component.
   * @param {string} message - The text content of the toast.
   */
  _alert(message) {
    this.setState({
      toasts: this.state.toasts.concat([{ text: message }])
    });
  }
  
  /**
   * Begin initialization. Load data from local storage and API.
   */
  _initialize() {
    const state = Object.assign({}, initialState);
    
    // Load initial data from API
    if (navigator.onLine) {
      // Access token is generated upon a successful login
      // Used to create new session without forcing login each time
      const token = localStorage.getItem('accessToken') || '';

      // Access token is required
      if (!token && ENVIRONMENT != 'dev')
        location.replace(XACC + 'login/service/14');

      request
        .get('../api/account')
        .query({ token })
        .end((err, res) => {
          // User not logged in
          if (err || !res.body.library) {
            location.replace(XACC + 'login/service/14');
          }
          else {
            state.account = res.body;
            
            loadBooksFromApi(state.account.library, null, books => {
              state.books = books;
              this._initialize2(state);
            });
          }
        });
    }
    // Attempt to pull data from local storage
    else {
      let account;

      localforage.getItem('account')
        .then(a => {
          account = a;

          if (account === null)
            this._alert('Could not load data from cloud or local storage');
          else
            return localforage.getItem('books');
        })
        .then(books => {
          state.account = account, state.books = books || [];
          this._initialize2(state);
        })
        .catch(err =>
          this._alert('Could not load data from cloud or local storage')
        );
    }
  }

  /**
   * Finish initialization.
   * @param {object} state 
   */
  _initialize2(state) {
    // Grab config from local storage if available
    localforage.getItem('config')
      .then(config => {
        if (config != null) state.config = config;
          
        this.state = state;

        // Set theme
        document.body.className = 'theme-' + state.config.general.theme;

        // Push initial state to store
        store.dispatch({
          type: INITIALIZE_STATE, state
        });

        // Set state.view based on current url hash
        updateView(store);
        
        // Save state.account, state.books to local storage
        if (navigator.onLine) {
          store.dispatch(save('account'));
          store.dispatch(save('books'));
        }
      })
      .catch(err =>
        this._alert('Could not load user settings')
      );
  }
  
  /**
   * Add global event listeners.
   */
  _addListeners() {
    store.subscribe(() => {
      const state = store.getState();
      
      this.setState(state);
      
      if (LOG_STATE) console.log(state);
      
      if (state.save) {
        localforage.setItem(state.save, state[state.save]);
        store.dispatch(save(''));
      }
    });

    window.onresize = () => {
      clearInterval(this.resizeTimer);

      this.resizeTimer = setTimeout(() => this.forceUpdate(), 250);
    };

    // Update state.view when url hash changes
    window.onhashchange = () => updateView(store);
  }

  render() {
    if (!this.state)
      return <div className='loading'><span>Loading xyBooks</span></div>;
    
    const view = (() => {
      const props = {
        data: this.state, dispatch: store.dispatch, alert: this._alert
      };

      switch (this.state.view.split('/')[0]) {
        case 'SETTINGS':
          return <Settings {...props} />;
        case 'ACCOUNT':
          return <Account {...props} />;
        case 'LIBRARY':
          return <Library {...props} />;
        case 'BOOKS':
          return <Books {...props} />;
      }
    })();
    
    return (
      <div className='xyfir-books'>
        <Toolbar
          colored fixed
          actions={[
            <Button
              icon
              key='home'
              onClick={() => location.hash = '#'}
            >home</Button>
          ]}
          title='xyBooks'
          nav={
            <Button
              icon
              onClick={() => this.setState({ drawer: true })}
            >menu</Button>
          }
        />

        <Drawer
          onVisibilityToggle={v => this.setState({ drawer: v })}
          autoclose={true}
          navItems={[
            <a href='#account'>
              <ListItem primaryText='Account' />
            </a>,
            <a href='#library/info'>
              <ListItem primaryText='Manage Library' />
            </a>,
            <a onClick={() => this.onLogout()}>
              <ListItem primaryText='Logout' />
            </a>,

            <Divider />,

            <Subheader primary primaryText='Books' />,
            <a href='#books/list'>
              <ListItem primaryText='View' />
            </a>,
            <a href='#books/list'>
              <ListItem primaryText='Upload' />
            </a>,

            <Divider />,

            <Subheader primary primaryText='Settings' />,

            <a href='#settings/general'>
              <ListItem primaryText='General' />
            </a>,
            <a href='#settings/reader'>
              <ListItem primaryText='Reader' />
            </a>,
            <a href='#settings/book-list'>
              <ListItem primaryText='Book List' />
            </a>
          ]}
          visible={this.state.drawer}
          header={
            <Toolbar
              colored
              nav={
                <Button
                  icon
                  onClick={() => this.setState({ drawer: false })}
                >arrow_back</Button>
              }
            />
          }
          type={Drawer.DrawerTypes.TEMPORARY}
        />

        <div className='main md-toolbar-relative'>{view}</div>

        <Snackbar
          toasts={this.state.toasts}
          onDismiss={() => this.onDismissAlert()}
        />
      </div>
    );
  }

}

render(<App />, window.content);