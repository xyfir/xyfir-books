import React from 'react';

// react-md
import Button from 'react-md/lib/Buttons/Button';

export default class WebSearchAnnotation extends React.Component {
  constructor(props) {
    super(props);

    this.state = { context: false };
  }

  render() {
    const { annotation } = this.props;

    return (
      <div className="search">
        {annotation.context ? (
          <Button
            floating
            fixed
            secondary
            tooltipPosition="right"
            fixedPosition="bl"
            iconChildren="search"
            tooltipLabel={(this.state.context ? 'Remove' : 'Add') + ' context'}
            onClick={() => this.setState({ context: !this.state.context })}
          />
        ) : null}

        <iframe
          src={
            '//www.bing.com/search?q=' +
            (this.state.context ? annotation.context + ' ' : '') +
            annotation.value
          }
          className="search"
        />
      </div>
    );
  }
}
