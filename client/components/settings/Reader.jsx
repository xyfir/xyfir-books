import { SelectField, TextField, Button, Paper } from 'react-md';
import request from 'superagent';
import React from 'react';

// Constants
import { XYANNOTATIONS_URL, XYBOOKS_URL } from 'constants/config';
import initialState from 'constants/initial-state';
import * as themes from 'constants/reader-themes';

// Action creators
import { setXyAnnotationsKey } from 'actions/creators/account';
import { setReader } from 'actions/creators/settings';
import { save } from 'actions/creators/index';

// Components
import ColorPicker from 'components/misc/ColorPicker';

// Modules
import parseQuery from 'lib/url/parse-query-string';

export default class ReaderSettings extends React.Component {

  constructor(props) {
    super(props);

    this.state = this.props.App.state.config.reader;
  }

  componentDidMount() {
    const q = parseQuery();

    if (q.subscriptionKey && +q.subscriptionKey != 0) {
      this._annotationsKey.getField().value = q.subscriptionKey;
      this.onSaveKey();
    }
  }

  onRequestSubscription() {
    if (!navigator.onLine)
      return this.props.App._alert('Internet connectivity required');

    location.href =
      `${XYANNOTATIONS_URL}/#/account/subscription/request?redirect=` +
      encodeURIComponent(
        `${XYBOOKS_URL}/app/#/settings/reader?subscriptionKey=SUBSCRIPTION_KEY`
      );
  }

  onSetTheme(theme) {
    switch (theme) {
      case 'light': return this.setState(themes.LIGHT);
      case 'dark': return this.setState(themes.DARK);
    }
  }

  onSaveStyles() {
    const {App} = this.props;

    App.store.dispatch(
      setReader(
        Date.now() > App.state.account.subscription
          ? initialState.config.reader
          : this.state
      )
    );
    App.store.dispatch(save(['config']));
    App._alert('Settings saved successfully');
  }

  onResetStyles() {
    this.setState(initialState.config.reader);
  }

  onSaveKey() {
    const xyAnnotationsKey = this._annotationsKey.value;
    const {App} = this.props;

    request
      .put(`${XYBOOKS_URL}/api/account`)
      .send({ xyAnnotationsKey })
      .end((err, res) => {
        if (err || res.body.error)
          return App._alert('Could not save changes');

        App.store.dispatch(setXyAnnotationsKey(xyAnnotationsKey));
        App._alert('xyAnnotations subscription key set');
        App.store.dispatch(save(['config']));
      });
  }

  render() {
    const { account } = this.props.App.state;

    return (
      <div className='reader-settings'>
        {Date.now() > account.subscription ? (
          <p>Free users cannot use global reader themes or set custom styling.</p>
        ) : null}

        <Paper
          zDepth={1}
          component='section'
          className='theme section flex'
        >
          <SelectField
            id='select--theme'
            label='Reader Theme'
            onChange={v => this.onSetTheme(v)}
            menuItems={[
              { label: 'Light', value: 'light' },
              { label: 'Dark', value: 'dark' }
            ]}
            className='md-cell'
          />

          <br />

          <TextField
            id='number--font-size'
            min={0.1}
            step={0.1}
            type='number'
            label='Font Size'
            value={this.state.fontSize}
            onChange={v => this.setState({ fontSize: +v })}
            className='md-cell'
          />

          <span
            className='example font-size'
            style={{fontSize: this.state.fontSize + 'em'}}
          >Example Text</span>

          <br />

          <ColorPicker
            id='font-color'
            label='Font Color'
            value={this.state.color}
            onChange={v => this.setState({ color: v })}
          />

          <ColorPicker
            id='background-color'
            label='Background Color'
            value={this.state.backgroundColor}
            onChange={v => this.setState({ backgroundColor: v })}
          />

          <span style={{
            color: this.state.color,
            backgroundColor: this.state.backgroundColor
          }}>Example Text</span>

          <br />

          <ColorPicker
            id='highlight-color'
            label='Highlight / Notes Color'
            value={this.state.highlightColor}
            onChange={v => this.setState({ highlightColor: v })}
          />

          <span style={{
            color: this.state.color,
            backgroundColor: this.state.highlightColor
          }}>Example Text</span>

          <br />

          <TextField
            id='number--line-spacing'
            min={1}
            step={0.1}
            type='number'
            label='Line Spacing'
            value={this.state.lineHeight}
            onChange={v => this.setState({ lineHeight: +v })}
            className='md-cell'
          />

          <div style={{lineHeight: this.state.lineHeight}}>
            Line 1<br />Line 2<br />Line 3
          </div>

          <br />

          <ColorPicker
            id='annotation-color'
            label='Annotation Color'
            value={this.state.annotationColor}
            onChange={v => this.setState({ annotationColor: v })}
          />

          <span style={{
            color: this.state.color,
            backgroundColor: this.state.annotationColor
          }}>Example Text</span>

          <br />

          <SelectField
            id='select--default-highlight-mode'
            label='Default Highlight Mode'
            onChange={v => this.setState({ defaultHighlightMode: v })}
            menuItems={[
              { label: 'None', value: 'none' },
              { label: 'Notes', value: 'notes' },
              { label: 'Annotations', value: 'annotations' }
            ]}
            className='md-cell'
            defaultValue='none'
          />

          <Button
            primary raised
            iconChildren='save'
            onClick={() => this.onSaveStyles()}
          >Save</Button>

          <Button
            secondary raised
            iconChildren='clear'
            onClick={() => this.onResetStyles()}
          >Reset</Button>
        </Paper>

        <Paper
          zDepth={1}
          component='section'
          className='xyfir-annotations section flex'
        >
          <h3>Xyfir Annotations</h3>
          <p>
            A xyAnnotations subscription allows you to find and download annotations for books that you're reading.
            <br />
            xyAnnotations subscriptions can be purchased directly through <a href='https://annotations.xyfir.com/' target='_blank'>xyAnnotations</a>, or through certain other reader applications that support xyAnnotations.
            <br />
            New xyBooks accounts are automatically given a free one-month subscription.
          </p>

          <TextField
            id='text--xyannotations-key'
            ref={i => this._annotationsKey = i}
            type='text'
            label='Subscription Key'
            className='md-cell'
            defaultValue={account.xyAnnotationsKey}
          />

          <Button
            primary raised
            iconChildren='save'
            onClick={() => this.onSaveKey()}
          >Save</Button>

          <p>
            If you have already purchased a subscription through xyAnnotations, you can easily have xyBooks request access to your subscription key using the button below.
            <br />
            You will be redirected to xyAnnotations where you'll login, allow the request, and then you'll be brought back here.
          </p>

          <Button
            secondary raised
            iconChildren='navigate_next'
            onClick={() => this.onRequestSubscription()}
          >Request Access</Button>
        </Paper>
      </div>
    );
  }

}