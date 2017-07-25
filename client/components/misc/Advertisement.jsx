import PropTypes from 'prop-types';
import request from 'superagent';
import React from 'react';

// react-md
import Button from 'react-md/lib/Buttons/Button';
import Paper from 'react-md/lib/Papers';

// Constants
import { READ_BOOK } from 'constants/views';

export default class Advertisement extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = {};

    setTimeout(() => this._loadAd(), 120000);
  }

  onClose() {
    this.setState({ ad: null });
    setTimeout(() => this._loadAd(), 300000);
  }

  _loadAd() {
    const { data } = this.props;

    // Only display if user is free and not reading a book
    if (
      data.account.subscription > Date.now() ||
      data.view == READ_BOOK
    ) return setTimeout(() => this._loadAd(), 300000);

    // Get content for xyAds to parse for keywords
    let content = '';
    if (data.books.length) {
      const book = data.books[Math.floor(Math.random() * data.books.length)];

      content =
        book.authors + ' ' +
        book.title + ' ' +
        book.comments;
    }
    
    request
      .get(`../api/ad`)
      .query({ content })
      .end((err, res) => {
        if (err || res.body.error)
          return setTimeout(() => this._loadAd(), 300000);
        
        // Allow user to close ad after 7 seconds
        this.setState({ ad: res.body.ad, canClose: false });
        setTimeout(() => this.setState({ canClose: true }), 7000);
      });
  }

  render() {
    const { ad } = this.state;

    if (!ad) return null;

    return (
      <Paper
        zDepth={1}
        component='section'
        className='section'
      >
        <a onClick={() => location.href = ad.link}>{ad.title}</a>
        <span> // {ad.description}</span>

        <br />

        <small>
          xyBooks Premium removes ads.

          {this.state.canClose ? (
            <a onClick={() => this.onClose()}> [close]</a>
          ) : null}
        </small>
      </Paper>
    );
  }

}