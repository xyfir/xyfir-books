import request from 'superagent';
import marked from 'marked';
import React from 'react';

// react-md
import TabsContainer from 'react-md/lib/Tabs/TabsContainer';
import TextField from 'react-md/lib/TextFields';
import ListItem from 'react-md/lib/Lists/ListItem';
import Button from 'react-md/lib/Buttons/Button';
import List from 'react-md/lib/Lists/List';
import Tabs from 'react-md/lib/Tabs/Tabs';
import Tab from 'react-md/lib/Tabs/Tab';

// Constants
import { XYFIR_ANNOTATIONS } from 'constants/config';

export default class ManageAnnotations extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			key: this.props.reader.props.data.config.reader.annotationsKey,
			sets: [], set: 0, tab: 0
		};
	}

	onSearch() {
		clearTimeout(this.searchTimeout);

		this.searchTimeout = setTimeout(
      () => request
        .get(XYFIR_ANNOTATIONS + 'sets')
        .query({
          sort: 'top', direction: 'desc',
          search: this.refs.search.getField().value
        })
        .end((err, res) => !err && this.setState(res.body)),
      200
    );
	}

	onDownload() {
		const { annotations } = this.props.reader.state.book;
		const set = this.state.sets.find(set => set.id == this.state.set);

		// Download set's items
    request
      .get(XYFIR_ANNOTATIONS + 'annotations')
      .query({
        subscriptionKey: this.state.key,
        sets: JSON.stringify([{ id: set.id }])
      })
      .end((err, res) => {
        if (
          err || res.body.error || !res.body[set.id] || !res.body[set.id].items
        ) {
          this.props.reader.props.alert('Could not download set');
        }
        else {
          set.items = res.body[set.id].items;

          annotations.push(set);

          this.props.reader._updateBook({ annotations });
          this.setState({ set: 0 });

          // Ensure current book's highlighted content is updated
          this.props.reader.onCycleHighlightMode();
        }
      });
	}

	onDelete() {
		const annotations = this.props.reader.state.book.annotations
      .filter(a => a.id != this.state.set);

		// Remove set from book.annotations
		this.props.reader._updateBook({ annotations });
		this.setState({ set: 0 });

		// Ensure current book's highlighted content is updated
		this.props.reader.onCycleHighlightMode();
	}

  _renderView(annotations) {
    const isDownloaded = !!annotations.find(a => a.id == this.state.set);
    const set = isDownloaded
      ? annotations.find(a => a.id == this.state.set)
      : this.state.sets.find(a => a.id == this.state.set);

    return (
      <div className='manage-annotations view-set'>
        <Button
          raised
          label='Back'
          onClick={() => this.setState({ set: 0 })}
        >arrow_back</Button>

        {isDownloaded ? (
          <Button
            raised secondary
            label='Trash'
            onClick={() => this.onDelete()}
          >delete</Button>
        ) : (
          <Button
            raised primary
            label='Save'
            onClick={() => this.onDownload()}
          >cloud_download</Button>
        )}
        
        <h3 className='title'>{set.set_title}</h3>

        <span className='book'>
          {set.book_title} by {set.book_authors}
        </span>

        <div
          className='markdown-body description'
          dangerouslySetInnerHTML={{ __html:
            marked(set.set_description, { sanitize: true })
          }}
        />
      </div>
    );
  }

  _renderDiscover() {
    if (!this.state.key) {
      return (
        <p>
          <strong>Note:</strong> You have not set a <a href='https://annotations.xyfir.com/' target='_blank'>Xyfir Annotations</a> subscription key. If you have a key, you can set it in your <a href='#settings/reader'>reader settings</a>.
        </p>
      );
    }

    return (
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
              primaryText={a.set_title}
              secondaryText={
                `${a.book_title} by ${a.book_authors}` +
                '\n' +
                a.set_description.split('\n')[0]
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
            primaryText={a.set_title}
            secondaryText={
              `Contains ${a.items.length} annotations` +
              '\n' +
              a.set_description.split('\n')[0]
            }
          />
        )
      }</List>
    );
  }

	render() {
    const { annotations } = this.props.reader.state.book;

		if (this.state.set) return this._renderView(annotations);
		
    return (
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
    );
	}

}