import { Button } from 'react-md';
import React from 'react';

// Actions
import { setPage } from 'actions/app';

export default class Pagination extends React.Component {
  constructor(props) {
    super(props);
  }

  onGoTo(page) {
    this.props.dispatch(setPage(page));
  }

  _buildPagination() {
    const pagination = {
      page: this.props.data.search.page,
      pages: Math.ceil(this.props.items / this.props.itemsPerPage) || 1,
      isNextPage: false,
      isPrevPage: false,
      isPrevPageFirst: false,
      isNextPageLast: false
    };

    // Set boolean values
    if (pagination.pages > pagination.page) pagination.isNextPage = true;
    if (pagination.page > 1) pagination.isPrevPage = true;
    if (pagination.pages == pagination.page + 1)
      pagination.isNextPageLast = true;
    if (pagination.isPrevPage && pagination.page - 1 == 1)
      pagination.isPrevPageFirst = true;

    return pagination;
  }

  render() {
    const pagination = this._buildPagination();

    return (
      <section className="pagination">
        {pagination.isPrevPage && !pagination.isPrevPageFirst ? (
          <Button
            icon
            onClick={() => this.onGoTo(1)}
            iconChildren="first_page"
          />
        ) : null}

        {pagination.isPrevPage ? (
          <Button
            icon
            secondary
            onClick={() => this.onGoTo(pagination.page - 1)}
            iconChildren="navigate_before"
          />
        ) : null}

        {pagination.isNextPage ? (
          <Button
            icon
            primary
            onClick={() => this.onGoTo(pagination.page + 1)}
            iconChildren="navigate_next"
          />
        ) : null}

        {pagination.isNextPage && !pagination.isNextPageLast ? (
          <Button
            icon
            onClick={() => this.onGoTo(pagination.pages)}
            iconChildren="last_page"
          />
        ) : null}
      </section>
    );
  }
}
