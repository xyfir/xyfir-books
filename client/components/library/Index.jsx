import React from 'react';

// Components
import Upload from 'components/library/Upload';
import Info from 'components/library/Info';

export default class ManageLibrary extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		switch (this.props.data.view.split('/')[1]) {
			case 'DOWNLOAD':
				return <Download data={this.props.data} dispatch={this.props.dispatch} />
			case 'UPLOAD':
				return <Upload data={this.props.data} dispatch={this.props.dispatch} />
			case 'INFO':
				return <Info data={this.props.data} dispatch={this.props.dispatch} />
		}
	}

}