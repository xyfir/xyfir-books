import {
  Paper, Button, Checkbox, SelectField
} from 'react-md';
import React from 'react';

// Action creators
import { setBookList } from 'actions/settings';
import { save } from 'actions/index';

export default class BookListSettings extends React.Component {

  constructor(props) {
    super(props);

    this.columns = [
      'Title', 'Authors', 'Series', 'Added', 'Published', 'Publisher', 'Rating'
    ];
  }

  onSaveTable() {
    const columns = [];

    // Populate columns[] with columns to display
    this.columns.forEach(col => {
      if (window[`checkbox--${col}`].checked)
        columns.push(col.toLowerCase());
    });

    const defaultSort = {
      column: this._defaultSortColumn.value,
      asc: !!this._defaultSortDirection.value
    };

    // Update config object
    const config = Object.assign({}, this.props.data.config);
    config.bookList.table = { columns, defaultSort };

    // Update state
    this.props.dispatch(setBookList(config.bookList));
    this.props.dispatch(save('config'));
  }

  render() {
    const config = this.props.data.config.bookList;

    return (
      <div className='book-list-settings'>
        <Paper
          zDepth={1}
          component='section'
          className='table section'
        >
          <h2>Table</h2>
          <p>Settings for the 'Table' view of your books list.</p>

          <Paper
            zDepth={2}
            component='section'
            className='columns section flex'
          >
            <h3>Columns</h3>
            <p>Choose which columns will be shown in the table.</p>

            <ul className='columns'>{
              this.columns.map(col =>
                <li key={col}>
                  <Checkbox
                    id={`checkbox--${col}`}
                    label={col}
                    defaultChecked={
                      config.table.columns.indexOf(col.toLowerCase()) > -1
                    }
                  />
                </li>
              )
            }</ul>
          </Paper>

          <Paper
            zDepth={2}
            component='section'
            className='default-sort section flex'
          >
            <h3>Default Sort</h3>
            <p>Set how the books will initially be sorted in the table.</p>

            <SelectField
              id='select--column'
              ref={i => this._defaultSortColumn = i}
              label='Column'
              menuItems={
                this.columns.map(col =>
                  Object({ label: col, value: col.toLocaleUpperCase() })
                )
              }
              className='md-cell'
              defaultValue={config.table.defaultSort.column}
            />

            <SelectField
              id='select--direction'
              ref={i => this._defaultSortDirection = i}
              label='Direction'
              menuItems={[
                { label: 'Ascending (A to Z)', value: 1 },
                { label: 'Descending (Z to A)', value: 0 }
              ]}
              className='md-cell'
              defaultValue={+config.table.defaultSort.asc}
            />
          </Paper>

          <Button
            primary raised
            iconChildren='save'
            onClick={() => this.onSaveTable()}
          >Save</Button>
        </Paper>
      </div>
    );
  }

}