import React from 'react';

// react-md
import TextField from 'react-md/lib/TextFields';
import Paper from 'react-md/lib/Papers';

// Action creators
import { setSearch } from 'actions/creators/index';

// Modules
import parseQuery from 'lib/url/parse-hash-query';

export default class Search extends React.Component {

  constructor(props) {
    super(props);
    
    this.setValue = this.setValue.bind(this);
  }
  
  componentWillUnmount() {
    this.props.dispatch(setSearch(''));
  }
  
  onSearch(sv) {
    clearTimeout(this.timeout);

    // Clear query string
    if (!sv && parseQuery().search) {
      location.hash = location.hash.split('?')[0];
    }
    
    this.timeout = setTimeout(() =>
      this.props.dispatch(
        setSearch(this.refs.search.getField().value.toLowerCase())
      ), 150
    );
  }
  
  setValue(val) {
    this.refs.search.value = val;
    this.onSearch(true);
  }

  render() {
    return (
      <Paper zDepth={1} className='search section'>
        <TextField
          block paddedBlock
          id='search'
          ref='search'
          type='search'
          onChange={e => this.onSearch()}
          placeholder='Search'
        />
      </Paper>
    );
  }

}