import React from "react";

// Action creators
import { setLibrarySizeLimit } from "actions/creators/account";

// Constants
import { URL, STRIPE_KEY_PUB } from "constants/config";

// Modules
import request from "lib/request/index";

// Components
import NavBar from "components/misc/NavBar";

export default class IncreaseLibrarySizeLimit extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            limit: this.props.data.account.librarySizeLimit
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
                    limit: this.state.limit, stripeToken: res.id
                };
                
                request({
                    url: URL + "api/account/size-limit",
                    method: "PUT", data, success: (res) => {
                        if (res.err) {
                            swal("Error", res.message, "error");
                        }
                        else {
                            // Update state.account.librarySizeLimit
                            this.props.dispatch(setLibrarySizeLimit(data.limit));
                            
                            swal(
                                "Purchase Complete",
                                `Your new storage limit is ${data.limit} GB.`,
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
            <div className="increase-library-size-limit">
                <NavBar
                    home={true}
                    account={true}
                    title="Increase Size Limit"
                    library={true}
                    settings={""}
                    books={true}
                />
                
                <form className="form" onSubmit={() => this.onPurchase()}>
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

                    <div className="increase-size-limit">
                        <p>
                            You will be charged $0.15 for each GB over your current limit for each month remaining in your subscription. Remaining months (based on 30-day months) are rounded up.
                            <br />
                            If you add 2 gigabytes to your current limit and you have a month and a half remaining you will be charged $0.60 <em>(0.15 * 2 * 2)</em> .
                        </p>

                        <label>Add GB to Size Limit</label>
                        <input
                            onChange={
                                (e) => this.setState({ limit: e.target.value })
                            }
                            value={this.state.limit}
                            type="number"
                            step="1"
                            min={this.props.data.account.librarySizeLimit + 1}
                        />

                        <span>
                            <strong>Added cost per month:</strong> ${(
                                this.state.limit - this.props.data.account.librarySizeLimit
                            ) * 0.15}
                        </span>
                    </div>
                </form>

                <button
                    onClick={() => this.onPurchase()}
                    className="btn-primary"
                >Increase Storage Limit</button>
            </div>
        )
    }

}