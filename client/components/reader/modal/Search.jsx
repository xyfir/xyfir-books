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

  componentWillMount() {
    // Disable highlights so they don't mess with the search
    this.props.Reader.onSetHighlightMode({ mode: 'none' });
  }

  componentDidMount() {
    this._search.focus();
  }

  /** @param {string} cfi */
  onGoTo(cfi) {
    this.props.Reader.book.rendition.display(cfi);
  }

  onSearch() {
    const {Reader} = this.props;
    const content = Reader.book.rendition.getContents()[0];
    const query = this._search.value;

    if (!query.length) return this.setState({ results: [] });

    const matches = [];
    const search = new RegExp(escapeRegex(query), 'gi');
    const nodes = this._findMatchingNodes(content.content, search);

    for (let node of nodes) {
      const indexes = [];
      const text = node.innerText;
      let match;

      // Node's text may have multiple matches
      while (match = search.exec(text)) {
        indexes.push(match.index);
      }

      for (let start of indexes) {
        const end = start + query.length;

        const match = {
          before: text.substring(0, start),
          match: text.substring(start, end),
          after: text.substring(end),
          cfi: content.cfiFromNode(node)
        };

        // Limit `before` and `after` to 100 characters
        match.before = match.before.length > 100
          ? ('...' + match.before.substr(match.before.length - 100))
          : match.before,
        match.after = match.after.length > 100
          ? (match.after.substr(0, 100) + '...')
          : match.after;

        matches.push(match);
      }
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
            onKeyPress={e => e.key == 'Enter' && this.onSearch()}
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