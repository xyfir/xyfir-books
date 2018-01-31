import {
  TabsContainer, TextField, ListItem, Button, List, Tabs, Tab
} from 'react-md';
import request from 'superagent';
import marked from 'marked';
import React from 'react';

// Constants
import { XYANNOTATIONS_URL } from 'constants/config';

// Components
import Navigation from 'components/reader/modal/Navigation';
import OpenWindow from 'components/misc/OpenWindow';

export default class ManageAnnotations extends React.Component {

	constructor(props) {
    super(props);

    const {Reader} = props, {App} = Reader.props;

		this.state = {
			key: App.state.account.xyAnnotationsKey,
			sets: [], set: 0, tab: 0
    };

    request
      .get(`${XYANNOTATIONS_URL}/api/sets`)
      .query({
        sort: 'top',
        title: '',
        bookTitle: Reader.state.book.title,
        direction: 'desc',
        bookAuthors: Reader.state.book.authors
      })
      .end((err, res) => !err && this.setState(res.body));
	}

	onSearch() {
		clearTimeout(this.searchTimeout);

		this.searchTimeout = setTimeout(
      () => request
        .get(`${XYANNOTATIONS_URL}/api/sets`)
        .query({
          sort: 'top', direction: 'desc',
          search: this.refs.search.value
        })
        .end((err, res) => !err && this.setState(res.body)),
      200
    );
	}

	onDownload() {
    const {Reader} = this.props;
		const {annotations} = Reader.state.book;
		const set = this.state.sets.find(set => set.id == this.state.set);

		// Download set's items
    request
      .get(`${XYANNOTATIONS_URL}/api/annotations`)
      .query({
        subscriptionKey: this.state.key,
        sets: JSON.stringify([{ id: set.id }])
      })
      .end((err, res) => {
        if (
          err || res.body.error ||
          !res.body[set.id] || !res.body[set.id].items
        ) {
          return Reader.props.alert('Could not download set');
        }

        set.items = res.body[set.id].items;

        const index = annotations.push(set) - 1;
        Reader._updateBook({ annotations });

        this.setState({ set: 0 });

        Reader.onSetHighlightMode({ mode: 'annotations', index });
      });
	}

	onDelete() {
    const {Reader} = this.props;
		const annotations = Reader.state.book.annotations
      .filter(a => a.id != this.state.set);

		// Remove set from book.annotations
		Reader._updateBook({ annotations });

    this.setState({ set: 0 });

    if (annotations.length)
      Reader.onSetHighlightMode({ mode: 'annotations', index: 0 });
    else
		  Reader.onSetHighlightMode({ mode: 'none' });
	}

  _renderView(annotations) {
    const isDownloaded = !!annotations.find(a => a.id == this.state.set);
    const set = isDownloaded
      ? annotations.find(a => a.id == this.state.set)
      : this.state.sets.find(a => a.id == this.state.set);

    return (
      <section className='manage-annotations view-set'>
        <Navigation
          {...this.props}
          title='Annotations'
          actions={[
            <Button
              icon
              onClick={() => this.setState({ set: 0 })}
              iconChildren='search'
            />,
            isDownloaded ? (
              <Button
                icon
                onClick={() => this.onDelete()}
                iconChildren='delete'
              />
            ) : (
              <Button
                icon
                onClick={() => this.onDownload()}
                iconChildren='cloud_download'
              />
            )
          ]}
        />

        <h3 className='title'>{set.title}</h3>

        <span className='book'>
          {set.book_title} by {set.book_authors}
        </span>

        <div
          className='markdown-body description'
          dangerouslySetInnerHTML={{ __html:
            marked(set.description, { sanitize: true })
          }}
        />
      </section>
    );
  }

  _renderDiscover() {
    if (!this.state.key) return (
      <p>
        <strong>Note:</strong> You have not set a <OpenWindow href='https://annotations.xyfir.com/'>Xyfir Annotations</OpenWindow> subscription key. If you have a key, you can set it in your <a href='#/settings/reader'>reader settings</a>.
      </p>
    );
    else return (
      <div className='discover flex'>
        <TextField
          id='search'
          ref='search'
          type='search'
          label='Search'
          onChange={e => this.onSearch()}
          className='md-cell'
        />

        <List>{
          this.state.sets.map(a =>
            <ListItem
              threeLines
              key={a.id}
              onClick={() => this.setState({ set: a.id })}
              primaryText={a.title}
              secondaryText={
                `${a.book_title} by ${a.book_authors}` +
                '\n' +
                a.description.split('\n')[0]
              }
            />
          )
        }</List>
      </div>
    );
  }

  _renderDownloaded(annotations) {
    return (
      <List>{
        annotations.map(a =>
          <ListItem
            threeLines
            key={a.id}
            onClick={() => this.setState({ set: a.id })}
            primaryText={a.title}
            secondaryText={
              `Contains ${a.items.length} annotations` +
              '\n' +
              a.description.split('\n')[0]
            }
          />
        )
      }</List>
    );
  }

	render() {
    const {annotations} = this.props.Reader.state.book;

		if (this.state.set) return this._renderView(annotations);

    return (
      <section className='manage-annotations container'>
        <Navigation {...this.props} title='Annotations' />

        <TabsContainer
          colored
          className='manage-annotations find'
          onTabChange={i => this.setState({ tab: i })}
          activeTabIndex={this.state.tab}
        >
        <Tabs tabId='tab'>
          <Tab label='Discover'>
            {this.state.tab == 0 ? this._renderDiscover() : null}
          </Tab>

          <Tab label='Downloaded'>
            {this.state.tab == 1 ? this._renderDownloaded(annotations) : null}
          </Tab>
        </Tabs>
        </TabsContainer>
      </section>
    );
	}

}