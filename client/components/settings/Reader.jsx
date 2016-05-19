import React from "react";

// Components
import NavBar from "../misc/NavBar";

export default class ReaderSettings extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="settings-reader">
                <NavBar
                    home={true}
                    account={true}
                    title="Settings - Reader"
                    library={true}
                    settings={""}
                    books={true}
                />
            </div>
        );
    }

}