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
    const section = Reader.book.section();
    const search = new RegExp(escapeRegex(this._search.value), 'gi');

    const elements = this._findMatchingElements(section.document.body, search);
    const matches = [];

    for (let el of elements) {
      const content = el.innerText;
      const start = content.search(search);
      const end = start + this._search.value.length;

      const match = {
        cfi: section.cfiFromElement(el),
        before: content.substring(0, start),
        match: content.substring(start, end),
        after: content.substring(end)
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
   * @param {HTMLElement} el
   * @return {HTMLElement}
   */
  _getAncestors(el) {
    const elements = [];
    for (; el; el = el.parentElement) {
      elements.unshift(el);
    }
    return elements;
  }

  /**
   * @param {HTMLElement} ancestor
   * @param {HTMLElement} child
   * @return {boolean}
   */
  _isAncestor(ancestor, child) {
    return false;
    // if (ancestor === child) return false;

    // const ancestors = this._getAncestors(child);

    // return ancestors.findIndex(a => a === ancestor) > -1;
  }

  /**
   * Recursively calls itself to find the deepest possible elements whose
   *  `innerText` property matches the search.
   * @param {HTMLElement} el
   * @param {RegExp} search
   * @return {HTMLElement[]}
  */
  _findMatchingElements(el, search) {
    if (!search.test(el.innerText)) return [];

    let matches = [el];

    for (let child of el.children) {
      matches = matches.concat(this._findMatchingElements(child, search));
    }

    // Mark elements that contain a matching child element
    // for (let m1 of matches) {
    //   for (let m2 of matches) {
    //     // if (m1.parentElement === m2) m2.ignore = true;
    //     if (this._isAncestor(m1, m2)) m1.ignore = true;
    //   }
    // }

    if (matches.length > 1) matches.shift();

    return matches.filter(e => !e.ignore);
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