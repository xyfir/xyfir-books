import React from "react";

// Components
import Purchase from "./Purchase";
import NavBar from "../misc/NavBar";

// Constants
import { URL } from "../../constants/config";
import { PURCHASE_SUBSCRIPTION } from "../../constants/views";

export default class Account extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.data.view == PURCHASE_SUBSCRIPTION)
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
                                }</strong>
                            </p>
                            
                            <hr />
                            
                            <button
                                className="btn-primary"
                                onClick={() => location.hash = "account/purchase-subscription"}
                            >
                                Extend Subscription
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
                                onClick={() => location.hash = "account/purchase-subscription"}
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