import React from "react";

// Actions
import { setPage } from "actions/creators/index";

// Modules
import parseQuery from "lib/url/parse-hash-query";

export default class Pagination extends React.Component {

    constructor(props) {
        super(props);
    }
    
    onGoTo(page) {
        this.props.dispatch(setPage(page));
    }

    _buildPagination() {
        let pagination = {
            page: this.props.data.search.page, isNextPage: false,
            isPrevPage: false, isPrevPageFirst: false, isNextPageLast: false,
            pages: Math.ceil(this.props.items / this.props.itemsPerPage) || 1
        };

        // Set boolean values
        if (pagination.pages > pagination.page)
            pagination.isNextPage = true;
        if (pagination.page > 1)
            pagination.isPrevPage = true;
        if (pagination.pages == pagination.page + 1)
            pagination.isNextPageLast = true;
        if (pagination.isPrevPage && pagination.page - 1 == 1)
            pagination.isPrevPageFirst = true;

        return pagination;
    }

    render() {
        const pagination = this._buildPagination(); 

        return (
            <div className="pagination">
                {pagination.isPrevPage && !pagination.isPrevPageFirst ? (
                    <button
                        className="btn-secondary first"
                        onClick={() => this.onGoTo(1)}
                    >
                        First Page (1)
                    </button>
                ) : (
                    <span />
                )}

                {pagination.isPrevPage ? (
                    <button
                        className="btn-danger previous"
                        onClick={() => this.onGoTo(pagination.page - 1)}
                    >
                        Previous Page ({pagination.page - 1})
                    </button>
                ) : (
                    <span />
                )}
                
                {pagination.isNextPage ? (
                    <button
                        className="btn-primary next"
                        onClick={() => this.onGoTo(pagination.page + 1)}
                    >
                        Next Page ({pagination.page + 1})
                    </button>
                ) : (
                    <span />
                )}

                {pagination.isNextPage && !pagination.isNextPageLast ? (
                    <button
                        className="btn-secondary last"
                        onClick={() => this.onGoTo(pagination.pages)}
                    >
                        Last Page ({pagination.pages})
                    </button>
                ) : (
                    <span />
                )}
            </div>
        );
    }

}