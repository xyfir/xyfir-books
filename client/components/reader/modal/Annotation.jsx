import marked from "marked";
import React from "react";

// Constants
import annotationTypes from "constants/annotation-types";

export default class Annotation extends React.Component {

    constructor(props) {
        super(props);

        let annotations = [], target = this.props.target.split('-');

        // Find target item's annotations
        this.props.book.annotations.forEach(set => {
            if (set.id == target[0]) {
                set.items.forEach(item => {
                    if (item.id == target[1]) {
                        annotations = item.object.annotations;
                    }
                });
            }
        });

        this.state = { annotations, view: annotations[0].type };
        
        this.onChangeView = this.onChangeView.bind(this);
    }
    
    onChangeView(view) {
        this.setState({ view });
    }

    render() {
        const annotation = this.state.annotations.find(an => {
            return an.type == this.state.view;
        });

        return (
            <div className="annotation">
                <nav>{
                    this.state.annotations.map(an => {
                        return (
                            <a
                                onClick={() => this.onChangeView(an.type)}
                                className={
                                    annotationTypes[an.type].icon
                                    + (
                                        this.state.view == an.type
                                        ? " active" : ""
                                    )
                                }
                            />
                        );
                    })
                }</nav>
                
                <span className="annotation-name">{annotation.name}</span>
                
                {this.state.view == 1 ? (
                    <div
                        className="document"
                        dangerouslySetInnerHTML={{
                            __html: marked(annotation.value, { sanitize: true })
                        }}
                    />
                ) : this.state.view == 3 ? (
                    <iframe src={
                        "https://www.google.com/#q=" + annotation.value
                    } />
                ) : (
                    <iframe src={annotation.value} />
                )}
            </div>
        )
    }

}