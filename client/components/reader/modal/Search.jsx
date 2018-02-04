import { TextField, Button } from 'react-md';
import escapeRegex from 'escape-string-regexp';
import React from 'react';

// Components
import Navigation from 'components/reader/modal/Navigation';

export default class BookContentSearch extends React.Component {

  constructor(props) {
    super(props);

    this.state = { matches: [] };
  }

  /** @param {string} cfi */
  onGoTo(cfi) {
    this.props.Reader.book.rendition.display(cfi);
  }

  onSearch() {
    const {Reader} = this.props;
    const contents = Reader.book.rendition.getContents()[0];
    const search = new RegExp(escapeRegex(this._search.value), 'gi');

    const matches = [];
    const nodes = this._findMatchingNodes(contents.content, search);

    for (let node of nodes) {
      const content = node.innerText;
      const start = content.search(search);
      const end = start + this._search.value.length;

      const match = {
        before: content.substring(0, start),
        match: content.substring(start, end),
        after: content.substring(end),
        cfi: contents.cfiFromNode(node)
      };

      match.before = match.before.length > 100
        ? ('...' + match.before.substr(match.before.length - 100))
        : match.before,
      match.after = match.after.length > 100
        ? (match.after.substr(0, 100) + '...')
        : match.after;

      matches.push(match);
    }

    this.setState({ matches });
  }

  /**
   * Recursively calls itself to find the deepest possible nodes whose
   *  `innerText` property matches the search.
   * @param {Node} node
   * @param {RegExp} search
   * @return {Node[]}
  */
  _findMatchingNodes(node, search) {
    if (!search.test(node.innerText)) return [];

    let matches = [node];

    for (let child of node.childNodes) {
      matches = matches.concat(this._findMatchingNodes(child, search));
    }

    // Remove parent node, since children contain matches
    if (matches.length > 1) matches.shift();

    return matches;
  }

  render() {
    const {matches} = this.state;
    const {Reader} = this.props;

    return (
      <section className='book-content-search'>
        <Navigation {...this.props} title='Search' />

        <div className='search'>
          <TextField
            block paddedBlock
            id='search--search'
            ref={i => this._search = i}
            type='search'
            placeholder='Search'
          />
          <Button
            icon primary
            onClick={() => this.onSearch()}
            iconChildren='search'
          />
        </div>

        <ul className='matches'>{
          matches.map((match, i) =>
            <li
              key={i}
              onClick={() => this.onGoTo(match.cfi)}
              className='match'
            >
              <span className='before'>{match.before}</span>
              <span className='match'>{match.match}</span>
              <span className='after'>{match.after}</span>
            </li>
          )
        }</ul>
      </section>
    );
  }

}