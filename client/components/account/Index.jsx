import React from "react";

// Components
import Purchase from "./Purchase/Index";
import NavBar from "../misc/NavBar";

// Constants
import { URL } from "constants/config";

export default class Account extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.data.view.split('/')[1] == "PURCHASE")
            return <Purchase data={this.props.data} dispatch={this.props.dispatch} />;
        
        return (
            <div className="account">
                <NavBar
                    home={true}
                    title="Account"
                    library={true}
                    settings={""}
                    books={true}
                />
                
                <div className="subscription">{
                    this.props.data.account.subscription > Date.now() ? (
                        <div>
                            <p>
                                Your subscription will expire on <strong>{
                                    (new Date(this.props.data.account.subscription)).toLocaleString()
                                }</strong>.
                                <br />
                                Your library size limit is <strong>{
                                    this.props.data.account.librarySizeLimit + " GB"
                                }</strong>
                            </p>
                            
                            <hr />
                            
                            <button
                                className="btn-primary"
                                onClick={() => location.hash = "account/purchase/extend-subscription"}
                            >
                                Extend Subscription
                            </button>

                            <button
                                className="btn-secondary"
                                onClick={() => location.hash = "account/purchase/increase-size-limit"}
                            >
                                Increase Size limit
                            </button>
                       </div> 
                    ) : (
                        <div>
                            <p>
                                You do not have a Libyq subscription. Your library will be deleted after {
                                    (new Date(
                                        this.props.data.account.subscription + 604800000
                                    )).toLocaleString()
                                }.
                                <br />
                                Purchase a subscription to prevent your library from being deleted.
                            </p>
                            
                            <hr />
                            
                            <button
                                className="btn-primary"
                                onClick={() => location.hash = "account/purchase/subscription"}
                            >
                                Purchase Subscription
                            </button>
                        </div>
                    )
                }</div>
            </div>                
        );
    }    

}