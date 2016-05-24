import React from "react";

// Action creators
import { setBookList } from "../../actions/creators/settings";

// Components
import NavBar from "../misc/NavBar";

export default class BookListSettings extends React.Component {

    constructor(props) {
        super(props);
        
        this.onSaveTable = this.onSaveTable.bind(this);
    }
    
    onSaveTable() {
        let columns = [];
        
        // Populate columns[] with columns to display
        Object.keys(this.refs).forEach(k => {
            k = k.split('-');
            
            if (k[0] == "show" && this.refs[`show-${k[1]}`].checked) {
                columns.push(k[1].toLowerCase());
            }
        });
        
        let defaultSort = {
            column: this.refs["sort-col"].value,
            asc: !!(+this.refs["sort-direction"].value)
        };
        
        // Update config object
        let config = Object.assign({}, this.props.data.config);
        config.bookList.table = { columns, defaultSort };
        
        // Update state
        this.props.dispatch(setBookList(config.bookList));
        
        localforage.setItem("config", config)
            .then(c => { return; }).catch(e => { return; });
    }

    render() {
        const columns = [
            "Title", "Authors", "Series", "Added", "Published", "Publisher", "Rating"
        ], conf = this.props.data.config.bookList;
        
        return (
            <div className="settings-book-list">
                <NavBar
                    home={true}
                    account={true}
                    title="Settings - Book List"
                    library={true}
                    settings={""}
                    books={true}
                />
                
                <section className="table">
                    <h2>Table</h2>
                    
                    <h3>Columns</h3>
                    <table className="columns">
                        <thead>
                            <tr>
                                <th>Show</th>
                                <th>Column</th>
                            </tr>
                        </thead>
                        
                        <tbody>{
                            columns.map(col => {
                                return (
                                    <tr>
                                        <td><input type="checkbox" defaultChecked={
                                            conf.table.columns.indexOf(col.toLowerCase()) > -1
                                        } ref={`show-${col}`} /></td>
                                        <td>{col}</td>
                                    </tr>
                                );
                            })
                        }</tbody>
                    </table>
                    
                    <h3>Default Sort</h3>
                    <div>
                        <label>Column</label>
                        <select
                            ref="sort-col"
                            defaultValue={conf.table.defaultSort.column}
                        >{
                            columns.map(col => <option value={col.toLowerCase()}>{col}</option>)
                        }</select>
                        
                        <label>Direction</label>
                        <select
                            ref="sort-direction"
                            defaultValue={+conf.table.defaultSort.asc}
                        >
                            <option value="1">Ascending (A to Z)</option>
                            <option value="0">Descending (Z to A)</option>
                        </select>
                    </div>
                    
                    <button className="btn-primary" onClick={this.onSaveTable}>
                        Save Table Settings
                    </button>
                </section>
            </div>
        );
    }

}