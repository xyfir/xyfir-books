import { SelectField, Checkbox, Button, Paper } from 'react-md';
import React from 'react';

// Actions
import { setGeneral, setReader } from 'actions/settings';
import { save } from 'actions/app';

// Constants
import * as themes from 'constants/reader/themes';

export default class GeneralSettings extends React.Component {

  constructor(props) {
    super(props);
  }

  onSave() {
    const matchThemes = window['checkbox--match-themes'].checked;
    const theme = this._theme.state.value;
    const {App} = this.props;

    document.body.className = `theme-${theme}`;

    App.store.dispatch(setGeneral({ theme, matchThemes }));

    if (matchThemes) {
      App.store.dispatch(setReader(
        Object.assign({}, App.state.config.reader, themes[theme.toUpperCase()])
      ));
    }

    App.store.dispatch(save('config'));
  }

  onClear() {
    localforage.clear()
      .then(() => location.reload())
      .catch(() => this.props.App._alert('Could not clear storage'));
  }

  render() {
    const {config, account} = this.props.App.state;

    return (
      <div className='general-settings'>
        <Paper
          zDepth={1}
          component='section'
          className='section flex'
        >
          <SelectField
            id='select--theme'
            ref={i => this._theme = i}
            label='Theme'
            disabled={Date.now() > account.subscription}
            menuItems={[
              { label: 'Light', value: 'light' },
              { label: 'Dark', value: 'dark' }
            ]}
            className='md-cell'
            defaultValue={config.general.theme}
          />

          <Checkbox
            id='checkbox--match-themes'
            label='Auto-Match App and Reader Themes'
            defaultChecked={config.general.matchThemes}
          />

          <Button
            primary raised
            iconChildren='save'
            onClick={() => this.onSave()}
          >Save</Button>
        </Paper>

        <Paper
          zDepth={1}
          component='section'
          className='storage section flex'
        >
          <h2>Clear Local Storage</h2>
          <p>
            Frees up space on your local device. This data will still be available in the cloud and will be redownloaded and saved locally when you access it.
          </p>

          <Button
            secondary raised
            iconChildren='clear'
            onClick={() => this.onClear()}
          >Clear</Button>
        </Paper>
      </div>
    );
  }

}