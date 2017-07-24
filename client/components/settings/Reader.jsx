import React from 'react';

// Constants
import * as themes from 'constants/reader-themes';
import initialState from 'constants/initial-state';

// Action creators
import { setReader } from 'actions/creators/settings';
import { save } from 'actions/creators/index';

// react-md
import SelectField from 'react-md/lib/SelectFields';
import TextField from 'react-md/lib/TextFields';
import Button from 'react-md/lib/Buttons/Button';
import Paper from 'react-md/lib/Papers';

// Components
import ColorPicker from 'components/misc/ColorPicker';

export default class ReaderSettings extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = this.props.data.config.reader;
  }

  onSetTheme(theme) {
    switch (theme) {
      case 'light': return this.setState(themes.LIGHT);
      case 'dark': return this.setState(themes.DARK);
    }
  }
  
  onSave() {
    this.props.dispatch(setReader(Object.assign(
      {}, (
        Date.now() > this.props.data.account.subscription
          ? initialState.config.reader
          : this.state
      ), { annotationsKey: this.refs.annotationsKey.getField().value }
    )));
    this.props.dispatch(save('config'));
    
    swal('Saved', 'Settings saved successfully', 'success');
  }
  
  onReset() {
    this.setState(initialState.config.reader);
  }

  render() {
    const { account } = this.props.data;

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
          
          <TextField
            id='number--page-padding'
            min={0}
            step={0.1}
            type='number'
            label='Page Padding'
            value={this.state.padding}
            onChange={v => this.setState({ padding: +v })}
            className='md-cell'
          />
          
          <span
            className='example page-padding'
            style={{padding: `0em ${1 + this.state.padding}em` }}
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
        </Paper>

        <Paper
          zDepth={1}
          component='section'
          className='xyfir-annotations section flex'
        >
          <TextField
            id='text--xyannotations-key'
            ref='annotationsKey'
            type='text'
            label='Xyfir Annotations Subscription Key'
            helpText={
              'A xyAnnotations subscription key is needed to download ' +
              'annotations while reading a book.'
            }
            className='md-cell'
            defaultValue={this.state.annotationsKey}
          />
        </Paper>
      
        <Button
          primary raised
          onClick={() => this.onSave()}
          label='Save'
        >save</Button>

        <Button
          secondary raised
          onClick={() => this.onReset()}
          label='Reset'
        >clear</Button>
      </div>
    );
  }

}