import React from "react";

// Action creators
import { purchaseSubscription } from "../../actions/creators/account/subscription";

// Constants
import { URL, STRIPE_KEY_PUB } from "../../constants/config";

// Modules
import ajax from "../../lib/ajax";

export default class Purchase extends React.Component {

    constructor(props) {
        super(props);

        this.onPurchase = this.onPurchase.bind(this);
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
                subscription: +this.refs.subscription.value,
                stripeToken: res.id
            };
            
            if (data.subscription == 0) {
                swal("Error", "Select a subscription length", "error");
                return;
            }
            
            ajax({
                url: URL + "api/account/subscription",
                method: "PUT", data, success: (res) => {
                    if (res.err) {
                        swal("Error", res.message, "error");
                    }
                    else {
                        const days = [0, 30, 182, 365][data.subscription];
                        let subscription = this.props.data.account.subscription;
                        
                        if (Date.now() > subscription)
                            subscription = Date.now() + (days * 86400 * 1000);
                        else
                            subscription += (days * 86400 * 1000);
                        
                        this.props.dispatch(purchaseSubscription(subscription));
                        
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
        let element = document.createElement('script');
        element.src = 'https://js.stripe.com/v2/';
        element.type = 'text/javascript';
        element.onload = purchase;
        document.body.appendChild(element);
    }

    render() {
        return (
            <div className="purchase-subscription">
                <p>
                    If you already have a subscription, the length of the subscription you purchase will be added to your current subscription.
                </p>
                <div className="form">
                    <select ref="subscription" defaultValue="0">
                        <option value="0" disabled>Subscription Length</option>
                        <option value="1">1 Month   - $4</option>
                        <option value="2">6 Months  - $21</option>
                        <option value="3">12 Months - $36</option>
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
                    
                    <button onClick={this.onPurchase} className="btn-primary">Purchase</button>
                </div>
            </div>
        )
    }

}