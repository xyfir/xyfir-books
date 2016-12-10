import React from "react";

export default class BookInfo extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const b = this.props.book;

        return (
            <div className="book-info">
                <table><tbody>
                    <tr>
                        <th>Title</th>
                        <td>{b.title}</td>
                    </tr>
                    
                    <tr>
                        <th>Authors</th>
                        <td>{b.authors}</td>
                    </tr>

                    <tr>
                        <th>Publisher</th>
                        <td>{b.publisher}</td>
                    </tr>

                    <tr>
                        <th>Published</th>
                        <td>{(b.pubdate || "").split('T')[0]}</td>
                    </tr>

                    <tr>
                        <th>Added</th>
                        <td>{b.timestamp.split('T')[0]}</td>
                    </tr>

                    <tr>
                        <th>Tags</th>
                        <td>{b.tags.map(tag =>
                            <span className="tag">{tag}</span>
                        )}</td>
                    </tr>

                    <tr>
                        <th>Series</th>
                        <td>{b.series}</td>
                    </tr>
                </tbody></table>

                <div
                    className="comments"
                    dangerouslySetInnerHTML={{__html: b.comments }}
                />
            </div>
        )
    }

}