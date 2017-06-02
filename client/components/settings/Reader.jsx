import React from 'react';

// Constants
import * as themes from 'constants/reader-themes';
import initialState from 'constants/initial-state';

// Action creators
import { setReader } from 'actions/creators/settings';
import { save } from 'actions/creators/index';

export default class ReaderSettings extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = this.props.data.config.reader;
    
    this.onReset = this.onReset.bind(this);
    this.onSave = this.onSave.bind(this);
  }

  onSetTheme() {
    const theme = this.refs.theme.value;

    switch (theme) {
      case 'light': return this.setState(themes.LIGHT);
      case 'dark': return this.setState(themes.DARK);
    }
  }
  
  onSave() {
    this.props.dispatch(setReader(Object.assign(
      {}, this.state, { annotationsKey: this.refs.annotationsKey.value }
    )));
    this.props.dispatch(save('config'));
    
    swal('Saved', 'Settings saved successfully', 'success');
  }
  
  onReset() {
    this.setState(initialState.config.reader);
  }

  render() {
    return (
      <div className='settings-reader old'>
        <div className='settings'>
          <section className='theme'>
            <label>Reader Theme</label>
            <select
              ref='theme'
              onChange={() => this.onSetTheme()}
            >
              <option value='light'>Light</option>
              <option value='dark'>Dark</option>
            </select>
          </section>

          <section className='font-size'>
            <label>Font Size</label>
            <input
              type='number'
              value={this.state.fontSize}
              min='0.1' step='0.1'
              onChange={(e) => this.setState({ fontSize: e.target.value })}
            />
            <span style={{fontSize: this.state.fontSize + 'em'}}>
              Example Text
            </span>
          </section>
          
          <section className='padding'>
            <label>Page Padding</label>
            <input
              type='number'
              value={this.state.padding}
              min='0' step='0.1'
              onChange={(e) => this.setState({ padding: +e.target.value })}
            />
            <span
              className='example'
              style={{padding: `0em ${1 + this.state.padding}em` }}
            >Example Text</span>
          </section>
          
          <section className='font-color'>
            <label>Font Color</label>
            <input
              type='color'
              value={this.state.color}
              onChange={(e) => this.setState({ color: e.target.value })}
            />
            <label>Background Color</label>
            <input
              type='color'
              value={this.state.backgroundColor}
              onChange={(e) => this.setState({ backgroundColor: e.target.value })}
            />
            <span style={{
              color: this.state.color,
              backgroundColor: this.state.backgroundColor
            }}>Example Text</span>
          </section>
          
          <section className='highlight-color'>
            <label>Highlight / Notes Color</label>
            <input
              type='color'
              value={this.state.highlightColor}
              onChange={(e) => this.setState({ highlightColor: e.target.value })}
            />
            <span style={{
              color: this.state.color,
              backgroundColor: this.state.highlightColor
            }}>Example Text</span>
          </section>
          
          <section className='line-spacing'>
            <label>Line Spacing</label>
            <input
              type='number'
              value={this.state.lineHeight}
              min='1' step='0.1'
              onChange={(e) => this.setState({ lineHeight: e.target.value })}
            />
            <div style={{lineHeight: this.state.lineHeight}}>
              Line 1<br />Line 2<br />Line 3
            </div>
          </section>

          <section className='annotation-color'>
            <label>Annotation Color</label>
            <input
              type='color'
              value={this.state.annotationColor}
              onChange={(e) => this.setState({ annotationColor: e.target.value })}
            />
            <span style={{
              color: this.state.color,
              backgroundColor: this.state.annotationColor
            }}>Example Text</span>
          </section>

          <section className='default-highlight-mode'>
            <label>Default Highlight Mode</label>
            <select
              value={this.state.defaultHighlightMode}
              onChange={(e) => {
                this.setState({ defaultHighlightMode: e.target.value });
              }}
            >
              <option value='none'>None</option>
              <option value='notes'>Notes</option>
              <option value='annotations'>Annotations</option>
            </select>
          </section>

          <section className='xyfir-annotations'>
            <label>Xyfir Annotations Subscription Key</label>
            <span className='input-description'>
              A <a href='https://annotations.xyfir.com/' target='_blank'>Xyfir Annotations</a> subscription key is needed to enable <em>annotations mode</em> while reading books.
            </span>
            <input
              ref='annotationsKey'
              type='text'
              defaultValue={this.state.annotationsKey}
            />
          </section>
        
          <button onClick={this.onSave} className='btn-primary'>
            Save
          </button>
          
          <button onClick={this.onReset} className='btn-danger'>
            Reset
          </button>
        </div>
      </div>
    );
  }

}