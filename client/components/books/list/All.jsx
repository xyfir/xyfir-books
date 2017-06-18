import React from 'react';

// Components
import Compact from 'components/books/list/all/Compact';
import Search from 'components/misc/Search';
import Table from 'components/books/list/all/Table';
import Grid from 'components/books/list/all/Grid';

// Modules
import parseHashQuery from 'lib/url/parse-hash-query';

// react-md
import FontIcon from 'react-md/lib/FontIcons';
import ListItem from 'react-md/lib/Lists/ListItem';
import Button from 'react-md/lib/Buttons/Button';
import Dialog from 'react-md/lib/Dialogs';
import List from 'react-md/lib/Lists/List';

// Actions
import { setListView } from 'actions/creators/settings';
import { save } from 'actions/creators/index';

export default class ListAllBooks extends React.Component {

  constructor(props) {
    super(props);

    this.state = { dialog: false };

    this._updateSearch = this._updateSearch.bind(this);
  }
  
  componentDidMount() {
    this._updateSearch();
  }

  componentDidUpdate() {
    this._updateSearch();
  }

  onSearchInfo() {
    swal({
      title: 'Advanced Search Information',
      text: `
        For advanced searches you can search by metadata field
        <br/><br />
        <strong>Example:</strong> <code>authors:search title:contains_query</code>
        <br /><br />
        Use underscores in place of spaces when a search query for a field contains spaces.
        <br />
        Using multiple fields will return all books that match any of fields.
      `,
      html: true
    });
  }

  /**
   * Set the value for APP.state.config.bookList.view.
   * @param {string} view - 'compact|grid|table'
   */
  onSetListView(view) {
    this.props.dispatch(setListView(view));
    this.props.dispatch(save('config'));
    this.setState({ dialog: false });
  }

  _updateSearch() {
    const qo = parseHashQuery();
    
    if (qo.search) {
      delete qo.search;
      const qa = Object.keys(qo);

      const value = qa[0] + ':' + qo[qa[0]]
        .replace(new RegExp(' ', 'g'), '_');
      
      // Only set if value is different
      if (this.refs.search.refs.search.value != value)
        this.refs.search.setValue(value);
    }
  }

  render() {
    const view = (() => {
      switch (this.props.data.config.bookList.view) {
        case 'compact':
          return <Compact {...this.props} />
        case 'table':
          return <Table {...this.props} />
        case 'grid':
          return <Grid {...this.props} />;
      }
    })();
    
    return (
      <div className='list-all'>
        <div className='book-search'>
          <Search ref='search' dispatch={this.props.dispatch} />
          <a
            onClick={() => this.onSearchInfo()}
            className='icon-info'
          />
        </div>
        
        <div className='old'>{view}</div>

        <Button
          floating fixed secondary
          tooltipPosition='right'
          fixedPosition='bl'
          tooltipLabel='Set book list view'
          onClick={() => this.setState({ dialog: true })}
        >list</Button>

        <Dialog
          id='dialog--set-view'
          title='Set List View'
          onHide={() => this.setState({ dialog: false })}
          visible={this.state.dialog}
        >
          <List>
            <ListItem
              onClick={() => this.onSetListView('table')}
              leftIcon={<FontIcon>view_headline</FontIcon>}
              primaryText='Table'
              secondaryText='Lots of data. Not for mobile or small screens.'
            />
            <ListItem
              onClick={() => this.onSetListView('grid')}
              leftIcon={<FontIcon>view_module</FontIcon>}
              primaryText='Grid'
              secondaryText={
                'Minimal data, large covers.'
              }
            />
            <ListItem
              onClick={() => this.onSetListView('compact')}
              leftIcon={<FontIcon>view_list</FontIcon>}
              primaryText='Compact'
              secondaryText='Fits well on any device.'
            />
          </List>
        </Dialog>
      </div>
    );
  }

}