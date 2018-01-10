import { TextField, Paper } from 'react-md';
import React from 'react';

// Action creators
import { setSearch } from 'actions/app';

// Modules
import parseQuery from 'lib/url/parse-query-string';

export default class Search extends React.Component {

  constructor(props) {
    super(props);

    this.setValue = this.setValue.bind(this);
  }

  componentWillUnmount() {
    this.props.App.store.dispatch(setSearch(''));
  }

  onSearch(query) {
    location.hash = location.hash.split('?')[0];
    this.props.App.store.dispatch(setSearch(query));
  }

  setValue(val) {
    this.props.App.store.dispatch(setSearch(val));
  }

  render() {
    return (
      <Paper
        zDepth={1}
        component='section'
        className='search section'
      >
        <TextField
          block paddedBlock
          id='search'
          ref='search'
          type='search'
          value={this.props.App.state.search.query}
          onChange={q => this.onSearch(q)}
          placeholder='Search'
        />
      </Paper>
    );
  }

}