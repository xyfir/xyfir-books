import React from 'react';

// react-md
import TextField from 'react-md/lib/TextFields';
import Paper from 'react-md/lib/Papers';

// Action creators
import { setSearch } from 'actions/creators/index';

// Modules
import parseQuery from 'lib/url/parse-query-string';

export default class Search extends React.Component {

  constructor(props) {
    super(props);
    
    this.setValue = this.setValue.bind(this);
  }
  
  componentWillUnmount() {
    this.props.dispatch(setSearch(''));
  }
  
  onSearch(query) {
    location.hash = location.hash.split('?')[0];
    this.props.dispatch(setSearch(query))
  }
  
  setValue(val) {
    this.props.dispatch(setSearch(val))
  }

  render() {
    return (
      <Paper zDepth={1} className='search section'>
        <TextField
          block paddedBlock
          id='search'
          ref='search'
          type='search'
          value={this.props.data.search.query}
          onChange={q => this.onSearch(q)}
          placeholder='Search'
        />
      </Paper>
    );
  }

}