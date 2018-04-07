import { Slider, Button, Paper } from 'react-md';
import request from 'superagent';
import React from 'react';
import swal from 'sweetalert';

// Constants
import { XYBOOKS_URL } from 'constants/config';

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

  /** @param {string} type - `'iap|normal|swiftdemand'` */
  onPurchase(type) {
    request
      .post(`${XYBOOKS_URL}/api/account/purchase`)
      .send({
        type, tier: this.state.tier
      })
      .end((err, res) => {
        if (err || res.body.error)
          return swal('Error', res.body.message, 'error');
        location.href = res.body.url;
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

        <Button
          primary raised
          onClick={() => this.onPurchase('swiftdemand')}
        >Purchase</Button>
      </Paper>
    )
    else return (
      <Paper
        zDepth={1}
        component='section'
        className='purchase-subscription section flex'
      >
        <Slider
          discrete
          id='subscription-tier-slider'
          min={1}
          max={window.cordova ? 3 : 10}
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

        <Button
          raised primary
          onClick={() => this.onPurchase(window.cordova ? 'iap' : 'normal')}
        >Purchase</Button>
      </Paper>
    )
  }

}