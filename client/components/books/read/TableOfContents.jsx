import React from "react";

export default class TableOfContents extends React.Component {

    constructor(props) {
        super(props);
        
        epub.getToc().then(toc => {
            this.state = { toc };
        });
    }
    
    onOpenChapter(cfi) {
        epub.gotoCfi(cfi);
        this.props.onClose();
    }

    render() {
        if (!this.state) return <p>Loading...</p>;
        
        return (
            <ul className="table-of-contents">{
                this.state.toc.map(chapter => {
                    return (
                        <li><a onClick={this.onOpenChapter.bind(this, chapter.cfi)}>
                            {chapter.label.trim()}
                        </a></li>
                    );
                })
            }</ul>
        );
    }

}