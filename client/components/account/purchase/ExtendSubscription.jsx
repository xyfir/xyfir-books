import React from "react";

// Action creators
import { purchaseSubscription } from "actions/creators/account";

// Constants
import { URL, STRIPE_KEY_PUB } from "constants/config";

// Modules
import request from "lib/request/index";

// Components
import NavBar from "components/misc/NavBar";

export default class ExtendSubscription extends React.Component {

    constructor(props) {
        super(props);
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
                
                request({
                    url: URL + "api/account/subscription",
                    method: "PUT", data, success: (res) => {
                        if (res.error) {
                            swal("Error", res.message, "error");
                        }
                        else {
                            const days = [0, 30, 182, 365][data.subscription];
                            
                            const subscription = this.props.data.account.subscription
                                + (days * 86400000);
                            
                            // Update state.account.subscription
                            this.props.dispatch(purchaseSubscription(subscription));
                            
                            swal(
                                "Purchase Complete",
                                `Your subscription will expire on ${
                                    (new Date(subscription)).toLocaleString()
                                }.`,
                                "success"
                            );
                        }
                    }
                });
            });
        };
        
        // Dynamically load Stripe.js
        let element = document.createElement("script");
        element.src = "https://js.stripe.com/v2/";
        element.type = "text/javascript";
        element.onload = purchase;
        document.body.appendChild(element);
    }

    render() {
        return (
            <div className="extend-subscription">
                <NavBar
                    home={true}
                    account={true}
                    title="Extend Subscription"
                    library={true}
                    settings={""}
                    books={true}
                />

                <p>
                    The length of the subscription you purchase will be added to your remaining subscription time.
                    <br />
                    If you have increased your library storage size limit: you will be charged $0.15 for each added GB, for each month of your subscription.
                    <br />
                    {this.props.data.account.librarySizeLimit > 15 ? (
                        <span>
                            <strong>Note: </strong> You will be charged an additional ${
                                (this.props.data.account.librarySizeLimit - 15)
                                * 0.15
                            } per month due to your increased storage limit.
                        </span>
                    ) : <span />}
                </p>

                <hr />
                
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
                </form>

                <button
                    onClick={() => this.onPurchase()}
                    className="btn-primary"
                >Extend Subscription</button>
            </div>
        )
    }

}