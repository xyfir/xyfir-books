import React from "react";

// Action creators
import {
    purchaseSubscription, setLibrarySizeLimit
} from "actions/creators/account";

// Constants
import { URL, STRIPE_KEY_PUB } from "constants/config";

// Modules
import request from "lib/request/index";

// Components
import NavBar from "components/misc/NavBar";

export default class PurchaseSubscription extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            showIncreaseSizeLimit: false, addToSizeLimit: 0
        };
    }

    onPurchase() {
        const purchase = () => {
            Stripe.setPublishableKey(STRIPE_KEY_PUB);
            
            Stripe.card.createToken(this.refs.stripeForm, (s, res) => {
            if (res.error) {
                swal("Error", res.error.message, "error");
                return;
            }
            
            let data = {
                addToSizeLimit: +this.state.addToSizeLimit,
                subscription: +this.refs.subscription.value,
                stripeToken: res.id
            };
            
            if (data.subscription == 0) {
                swal("Error", "Select a subscription length", "error");
                return;
            }
            
            request({
                url: URL + "api/account/subscription",
                method: "POST", data, success: (res) => {
                    if (res.error) {
                        swal("Error", res.message, "error");
                    }
                    else {
                        const days = [0, 30, 182, 365][data.subscription];
                        
                        let subscription = Date.now() + (days * 86400 * 1000);
                        
                        // Update state.account.subscription|librarySizeLimit
                        this.props.dispatch(purchaseSubscription(subscription));
                        this.props.dispatch(setLibrarySizeLimit(
                            this.props.data.account.librarySizeLimit
                            + data.addToSizeLimit
                        ));
                        
                        swal(
                            "Purchase Complete",
                            `Your subscription will expire on ${(new Date(subscription)).toLocaleString()}.`,
                            "success"
                        );
                    }
                }
            });
        })};
        
        // Dynamically load Stripe.js
        let element = document.createElement("script");
        element.src = "https://js.stripe.com/v2/";
        element.type = "text/javascript";
        element.onload = purchase;
        document.body.appendChild(element);
    }

    render() {
        return (
            <div className="purchase-subscription">
                <NavBar
                    home={true}
                    account={true}
                    title="Purchase Subscription"
                    library={true}
                    settings={""}
                    books={true}
                />
                
                <form className="form" onSubmit={() => this.onPurchase()}>
                    <select ref="subscription" defaultValue="0">
                        <option value="0" disabled>Subscription Length</option>
                        <option value="1">30 Days  - $4</option>
                        <option value="2">182 Days - $21</option>
                        <option value="3">365 Days - $36</option>
                    </select>
                
                    <form ref="stripeForm" className="stripe-form">
                        <label>Card Number</label>
                        <input type="text" data-stripe="number"/>
        
                        <label>CVC</label>
                        <input type="number" data-stripe="cvc" />
                    
                        <div className="expiration">
                            <label>Expiration (MM/YYYY)</label>
                            <input type="number" data-stripe="exp-month" placeholder="07"/>
                            <span> / </span>
                            <input type="number" data-stripe="exp-year" placeholder="2020" />
                        </div>
                    </form>

                    {this.state.showIncreaseSizeLimit ? (
                        <div className="increase-size-limit">
                            <p>
                                A subscription with Libyq gives you 15 gigabytes of storage space for your ebook library. For most people, 15 gigabytes is more than enough to store thousands of ebooks.
                                <br />
                                Some people however have very large libraries that are above and beyond the 15 GB limit. If you're one of those people, you can increase your storage limit at a cost of <strong>$0.15</strong> per additional gigabyte over 15 GB. This is a monthly cost so 5 GB extra with a 6 months subscription would cost you $4.50 <em>((5 * 0.15) * 6)</em>.
                            </p>

                            <label>Add GB to Size Limit</label>
                            <input
                                onChange={
                                    (e) => this.setState({ addToSizeLimit: e.target.value })
                                }
                                value={this.state.addToSizeLimit}
                                type="number"
                                step="1"
                                min="0"
                            />

                            <span>
                                <strong>Added cost per month:</strong> ${
                                    (this.state.addToSizeLimit * 0.15).toFixed(2)
                                }
                            </span>
                        </div>
                    ) : (
                        <a onClick={
                            () => this.setState({ showIncreaseSizeLimit: true })
                        }>Increase Library Size Limit</a>
                    )}
                </form>

                <button
                    onClick={() => this.onPurchase()}
                    className="btn-primary"
                >Purchase</button>
            </div>
        )
    }

}