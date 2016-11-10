import React from "react";

// Components
import Purchase from "./purchase/Index";
import NavBar from "components/misc/NavBar";

// Constants
import { URL } from "constants/config";

export default class Account extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.data.view.split('/')[1] == "PURCHASE") {
            return (
                <Purchase
                    data={this.props.data}
                    dispatch={this.props.dispatch}
                />
            );
        }
        
        return (
            <div className="account">
                <NavBar
                    home={true}
                    title="Account"
                    library={true}
                    settings={""}
                    books={true}
                />

                <section className="referral-link">
                    <label>Referral Program</label>
                    <span className="input-description">
                        Refer new users to Libyq and they'll receive a free week and 10% off of their first purchase.
                        <br />
                        You'll receive one week of subscription time for every month they purchase.
                    </span>
                    <input
                        type="text" readonly
                        value={"https://libyq.com/#?r=" + this.props.data.account.uid}
                        onFocus={(e) => e.target.select()}
                    />
                </section>
                
                {this.props.data.account.subscription > Date.now() ? (
                    <section className="subscription-info">
                        <p>
                            Your subscription will expire on <strong>{
                                (new Date(this.props.data.account.subscription))
                                    .toLocaleString()
                            }</strong>.
                            <br />
                            Your library size limit is <strong>{
                                this.props.data.account.librarySizeLimit + " GB"
                            }</strong>
                        </p>
                    </section>
                ) : (
                    <section className="subscription-info">
                        <p>
                            You do not have a Libyq subscription.
                            <br />
                            {this.props.data.account.library != '' ? (
                                <span>
                                    Your library will be deleted after {
                                        (new Date(
                                            this.props.data.account.subscription
                                            + 604800000
                                        )).toLocaleString()
                                    }.
                                    <br />
                                    Purchase a subscription to prevent your library from being deleted.
                                </span>
                            ) : (
                                <span />
                            )}
                        </p>
                    </section>
                )}

                {this.props.data.account.subscription > Date.now() ? (
                    <section className="subscription-controls">
                        <button
                            className="btn-primary"
                            onClick={() => {
                                location.hash
                                    = "account/purchase/extend-subscription";
                            }}
                        >Extend Subscription</button>

                        <button
                            className="btn-secondary"
                            onClick={() => {
                                location.hash
                                    = "account/purchase/increase-size-limit";
                            }}
                        >Increase Size limit</button>
                    </section>
                ) : (
                    <section className="subscription-controls">
                        <button
                            className="btn-primary"
                            onClick={() => {
                                location.hash = "account/purchase/subscription";
                            }}
                        >Purchase Subscription</button>
                    </section>
                )}
            </div>                
        );
    }    

}