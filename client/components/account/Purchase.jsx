import { TextField, Slider, Button, Paper } from 'react-md';
import StripeCheckout from 'react-stripe-checkout';
import request from 'superagent';
import React from 'react';
import swal from 'sweetalert';

// Constants
import { STRIPE_KEY_PUB, XYBOOKS_URL } from 'constants/config';

export default class Purchase extends React.Component {

  constructor(props) {
    super(props);

    this.state = { tier: 1, gb: 1, price: 5 };
  }

  componentDidMount() {
    this.onSlide(1);
  }

  /** @param {number} tier */
  onSlide(tier) {
    const state = (() => {
      switch (tier) {
        case 1: return { tier: 1, gb: 1, price: 5 };
        case 2: return { tier: 2, gb: 10, price: 15 };
        case 3: return { tier: 3, gb: 15, price: 20 };
        default: return {
          tier, gb: tier * 5, price: 20 + ((tier - 3) * 7)
        };
      }
    })();

    this.setState(state);
  }

  /** @param {object} token */
  onStripePurchase(token) {
    request
      .post(`${XYBOOKS_URL}/api/account/purchase/stripe`)
      .send({
        token: token.id, tier: this.state.tier
      })
      .end((err, res) => {
          if (err || res.body.error) {
            swal('Error', res.body.message, 'error');
          }
          else {
            location.hash = '#/account';
            location.reload();
          }
      });
  }

  onSwiftDemandPurchase() {
    const swiftId = this._swiftId.value;

    if (!swiftId) return;

    request
      .post(`${XYBOOKS_URL}/api/account/purchase/swiftdemand`)
      .send({ swiftId })
      .end((err, res) => {
        if (err || !res.body.redirect)
          swal('Error', res.body.message, 'error');
        else
          location.href = res.body.redirect;
      });
  }

  /** @return {boolean} */
  _hasDiscount() {
    const {referral: r} = this.props.App.state.account;
    return (r.user || r.promo) && !r.hasMadePurchase;
  }

  render() {
    const {tier, gb, price} = this.state;
    const {referral} = this.props.App.state.account;
    const discount = this._hasDiscount();

    if (referral.source == 'swiftdemand' && !referral.hasMadePurchase) return (
      <Paper
        zDepth={1}
        component='section'
        className='purchase-subscription swiftdemand section flex'
      >
        <p>
          You can purchase a one-time, three month, 1GB subscription using SwiftDemand.
        </p>

        <TextField
          id='text--swift'
          ref={i => this._swiftId = i}
          type='text'
          label='Your Swift ID'
          className='md-cell'
        />

        <Button
          primary raised
          onClick={() => this.onSwiftDemandPurchase()}
        >Purchase</Button>
      </Paper>
    )
    else return (
      <Paper
        zDepth={1}
        component='section'
        className='purchase-subscription stripe section flex'
      >
        <Slider
          discrete
          id='subscription-tier-slider'
          min={1}
          max={10}
          step={1}
          label={
            `Premium Subscription (${gb}GB, $${
              discount ? price - (price * 0.05) : price
            }/yr)`
          }
          value={this.state.tier}
          onChange={v => this.onSlide(v)}
          discreteTicks={1}
        />

        <StripeCheckout
          bitcoin zipCode
          name='xyBooks // Xyfir, LLC'
          token={t => this.onStripePurchase(t)}
          image='https://books.xyfir.com/static/icons/android-chrome-192x192.png'
          amount={(discount ? price - (price * 0.05) : price) * 100}
          stripeKey={STRIPE_KEY_PUB}
          description='365 Days'
        />

        <Button
          raised primary
          onClick={() =>
            document.querySelector('.StripeCheckout').click()
          }
        >Purchase</Button>
      </Paper>
    )
  }

}