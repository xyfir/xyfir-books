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
                <div className="head">
                    {this.state.annotations.length > 1 ? (
                        <nav>{this.state.annotations.map(an => {
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
                        })}</nav>
                    ) : <div />}
                    
                    <span className="annotation-name">{annotation.name}</span>
                </div>
                
                <div className="value">{this.state.view == 1 ? (
                    <div
                        className="markdown document"
                        dangerouslySetInnerHTML={{
                            __html: marked(annotation.value, { sanitize: true })
                        }}
                    />
                ) : this.state.view == 2 ? (
                    <div className="link">
                        <a href={annotation.value} target="_blank">
                            Go to Link
                        </a>
                        <iframe src={annotation.value} />
                    </div>
                ) : this.state.view == 3 ? (
                    <div className="search">
                        <iframe src={"//www.bing.com/search?q=" + annotation.value} />
                    </div>
                ) : this.state.view == 4 ? (
                    <div className="image">
                        <a href={annotation.value} target="_blank">
                            Go to Image Link
                        </a>
                        <img src={annotation.value} />
                    </div>
                ) : this.state.view == 5 ? (
                    <div className="video">{
                        annotation.value.indexOf("youtube.com/") > -1 ? (
                            <iframe
                                src={annotation.value}
                                className="youtube"
                            />
                        ) : annotation.value.indexOf("vimeo.com/") > -1 ? (
                            <iframe
                                src={annotation.value}
                                className="viemo"
                            />
                        ) : (
                            <div>
                                <a href={annotation.value} target="_blank">
                                    Go to Video Link
                                </a>
                                <video src={annotation.value} controls />
                            </div>
                        )
                    }</div>
                ) : this.state.view == 6 ? (
                    <div className="audio">
                        <a href={annotation.value} target="_blank">
                            Go to Audio Link
                        </a>
                        <audio src={annotation.value} controls />
                    </div>
                ) : (
                    <div className="map">{
                        annotation.value.indexOf("http") == 0 ? (
                            <div>
                                <a href={annotation.value} target="_blank">
                                    Go to Map Link
                                </a>
                                <iframe src={annotation.value} />
                            </div>
                        ) : (
                            <iframe
                                src={
                                    "https://www.google.com/maps/embed/v1/place?key="
                                    + "AIzaSyAN0om9mFmy1QN6Wf54tXAowK4eT0ZUPrU"
                                    + "&q=" + annotation.value
                                }
                                className="gmaps"
                            />
                        )
                    }</div>
                )}</div>
            </div>
        )
    }

}