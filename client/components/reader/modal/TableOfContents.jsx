import React from "react";

export default class TableOfContents extends React.Component {

    constructor(props) {
        super(props);
    }
    
    onOpenChapter(cfi) {
        window.epub.gotoCfi(cfi);
        this.props.onClose();
    }

    render() {
        return (
            <ul className="table-of-contents">{
                window.epub.toc.map(chapter => {
                    return (
                        <li><a onClick={() => this.onOpenChapter(chapter.cfi)}>
                            {chapter.label.trim()}
                        </a></li>
                    );
                })
            }</ul>
        );
    }

}