import React from 'react';

// Action creators
import { setTheme } from 'actions/settings';
import { save } from 'actions/app';

// react-md
import SelectField from 'react-md/lib/SelectFields';
import Button from 'react-md/lib/Buttons/Button';
import Paper from 'react-md/lib/Papers';

export default class GeneralSettings extends React.Component {

  constructor(props) {
    super(props);
  }

  onSave() {
    const theme = this.refs.theme.state.value;

    document.body.className = 'theme-' + theme;

    this.props.dispatch(setTheme(theme));
    this.props.dispatch(save('config'));
  }

  onClear() {
    const next = location.reload();
    localforage.clear().then(next).catch(next);
  }

  render() {
    const { config, account } = this.props.data;

    return (
      <div className='general-settings'>
        <Paper
          zDepth={1}
          component='section'
          className='section flex'
        >
          <SelectField
            id='select--theme'
            ref='theme'
            label='Theme'
            disabled={Date.now() > account.subscription}
            menuItems={[
              { label: 'Light', value: 'light' },
              { label: 'Dark', value: 'dark' }
            ]}
            className='md-cell'
            defaultValue={config.general.theme}
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
            This data will still be available in the cloud and will be redownloaded and saved locally when you access it.
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