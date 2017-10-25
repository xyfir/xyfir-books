import marked from 'marked';
import React from 'react';

// Constants
import annotationTypes from 'constants/annotation-types';

// react-md
import ListItem from 'react-md/lib/Lists/ListItem';
import FontIcon from 'react-md/lib/FontIcons';
import Toolbar from 'react-md/lib/Toolbars';
import Divider from 'react-md/lib/Dividers';
import Button from 'react-md/lib/Buttons/Button';
import Drawer from 'react-md/lib/Drawers';

// Components
import Document from 'components/reader/modal/annotations/types/Document';
import Search from 'components/reader/modal/annotations/types/Search';
import Image from 'components/reader/modal/annotations/types/Image';
import Video from 'components/reader/modal/annotations/types/Video';
import Audio from 'components/reader/modal/annotations/types/Audio';
import Link from 'components/reader/modal/annotations/types/Link';
import Map from 'components/reader/modal/annotations/types/Map';

export default class ViewAnnotations extends React.Component {

  constructor(props) {
    super(props);

    const [setId, itemId] = this.props.reader.state.modal.target.split('-');
    
    const annotations = this.props.reader.state.book.annotations
      .find(set => set.id == setId).items
      .find(item => item.id == itemId).annotations;

    this.state = { annotations, index: 0, drawer: false };
  }

  render() {
    const annotation = this.state.annotations[this.state.index];

    const view = (() => {
      switch (annotation.type) {
        case 1:
          return <Document annotation={annotation} />
        case 2:
          return <Link annotation={annotation} />
        case 3:
          return <Search annotation={annotation} />
        case 4:
          return <Image annotation={annotation} />
        case 5:
          // ** TODO: Support multiple videos
          return (
            <Video link={
              Array.isArray(annotation.value)
                ? annotation.value[0]
                : annotation.value
            } />
          )
        case 6:
          return <Audio annotation={annotation} />
        case 7:
          return <Map annotation={annotation} />
      }
    })();

    return (
      <div className='annotation'>
        <Toolbar
          colored
          title={annotation.name}
          nav={
            <Button
              icon
              onClick={() => this.setState({ drawer: true })}
              iconChildren='menu'
            />
          }
        />

        <Drawer
          onVisibilityChange={v => this.setState({ drawer: v })}
          autoclose={true}
          navItems={
            this.state.annotations.map((a, index) =>
              <ListItem
                key={a.id}
                onClick={() => this.setState({ index })}
                leftIcon={
                  <FontIcon>{annotationTypes[a.type].icon}</FontIcon>
                }
                primaryText={a.name}
                secondaryText={annotationTypes[a.type].name}
              />
            )
          }
          visible={this.state.drawer}
          header={
            <Toolbar
              colored
              nav={
                <Button
                  icon
                  onClick={() => this.setState({ drawer: false })}
                  iconChildren='arrow_back'
                />
              }
            />
          }
          type={Drawer.DrawerTypes.TEMPORARY}
        />

        <div className='content'>{view}</div>
      </div>
    )
  }

}

ViewAnnotations.forceFullscreen = true;