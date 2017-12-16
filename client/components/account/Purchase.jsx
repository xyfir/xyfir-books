import { TextField, Button, Paper } from 'react-md';
import StripeCheckout from 'react-stripe-checkout';
import request from 'superagent';
import React from 'react';
import swal from 'sweetalert';

// Constants
import { STRIPE_KEY_PUB } from 'constants/config';

export default class Purchase extends React.Component {

  constructor(props) {
    super(props);
  }

  onStripePurchase(token) {
    request
      .post('/api/account/purchase/stripe')
      .send({ token: token.id })
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
      .post('/api/account/purchase/swiftdemand')
      .send({ swiftId })
      .end((err, res) => {
        if (err || !res.body.redirect)
          swal('Error', res.body.message, 'error');
        else
          location.href = res.body.redirect;
      });
  }

  render() {
    const { referral } = this.props.data.account;
    const discount =
      (referral.user || referral.promo) &&
      !referral.hasMadePurchase;

    if (referral.source == 'swiftdemand' && !referral.hasMadePurchase) return (
      <Paper
        zDepth={1}
        component='section'
        className='purchase-subscription swiftdemand section flex'
      >
        <p>
          You can purchase a one-time, three month subscription using SwiftDemand.
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
        <div className='info'>
          <p>
            A subscription with Xyfir Books costs $25 a year and gives you 15 gigabytes of storage space for your ebook library. For most people, 15 gigabytes is more than enough to store many thousands of ebooks. Contact support if you need more space, and we'll come up with a solution that fits your needs.
          </p>

          {discount ? (
            <p>You will receive 10% off of your first purchase!</p>
          ) : null}
        </div>

        <StripeCheckout
          bitcoin zipCode
          name='xyBooks // Xyfir, LLC'
          token={t => this.onStripePurchase(t)}
          image='https://books.xyfir.com/static/icons/android-chrome-192x192.png'
          amount={discount ? 2250 : 2500}
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