import { MenuButton, ListItem, FontIcon } from 'react-md';
import React from 'react';

// Components
import Compact from 'components/books/list/all/Compact';
import Search from 'components/misc/Search';
import Table from 'components/books/list/all/Table';
import Grid from 'components/books/list/all/Grid';

// Modules
import query from 'lib/url/parse-query-string';

// Actions
import { setListView } from 'actions/creators/settings';
import { save } from 'actions/creators/index';

export default class ListAllBooks extends React.Component {

  constructor(props) {
    super(props);

    this._updateSearch = this._updateSearch.bind(this);
  }

  componentDidMount() {
    this._updateSearch();
  }

  componentDidUpdate() {
    this._updateSearch();
  }

  /**
   * Set the value for APP.state.config.bookList.view.
   * @param {string} view - 'compact|grid|table'
   */
  onSetListView(view) {
    this.props.dispatch(setListView(view));
    this.props.dispatch(save('config'));
  }

  _updateSearch() {
    const qo = query();

    if (qo.search) {
      delete qo.search;
      const qa = Object.keys(qo);

      const value = `${qa[0]}:${qo[qa[0]].replace(/\s/g, '_')}`;

      // Only set if value is different
      if (this.props.data.search.query != value)
        this._search.setValue(value);
    }
  }

  render() {
    const view = (() => {
      switch (this.props.App.state.config.bookList.view) {
        case 'compact': return <Compact {...this.props} />
        case 'table': return <Table {...this.props} />
        case 'grid': return <Grid {...this.props} />
      }
    })();

    return (
      <div className='book-list container'>
        <section className='controls'>
          <Search ref={i => this._search = i} {...this.props} />

          <MenuButton
            icon secondary
            id='menu--set-list-view'
            menuItems={[
              window.innerWidth > 950 ? (
                <ListItem
                  onClick={() => this.onSetListView('table')}
                  leftIcon={<FontIcon>view_headline</FontIcon>}
                  primaryText='Table'
                />
              ) : (
                <span />
              ),
              <ListItem
                onClick={() => this.onSetListView('grid')}
                leftIcon={<FontIcon>view_module</FontIcon>}
                primaryText='Grid'
              />,
              <ListItem
                onClick={() => this.onSetListView('compact')}
                leftIcon={<FontIcon>view_list</FontIcon>}
                primaryText='Compact'
              />
            ]}
            iconChildren='list'
          />
        </section>

        {view}
      </div>
    );
  }

}