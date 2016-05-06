import React from "react";

// Components
import Purchase from "./Purchase";

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
                <div className="subscription">{
                    this.props.data.account.subscription > Date.now()
                    ? (
                       <div>
                           Your subscription will expire on <strong>{
                               (new Date(this.props.data.account.subscription)).toLocaleString()
                           }</strong>
                           <br />
                           <a href="#account/purchase-subscription" className="btn btn-primary">
                               Extend Subscription
                           </a>
                       </div> 
                    )
                    : (
                        <div>
                            You do not have a Libyq subscription. Your library will be deleted after {
                                (new Date(
                                    this.props.data.account.subscription + 604800000
                                )).toLocaleString()
                            }. Purchase a subscription to prevent your library from being deleted.
                            <br />
                            <a href="#account/purchase-subscription" className="btn btn-primary">
                                Purchase Subscription
                            </a>
                        </div>
                    )
                }</div>
            </div>                
        );
    }    

}