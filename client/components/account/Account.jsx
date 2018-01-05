import moment from 'moment';
import React from 'react';
import copy from 'copyr';

// react-md
import Button from 'react-md/lib/Buttons/Button';
import Paper from 'react-md/lib/Papers';

// Components
import Purchase from 'components/account/Purchase';

export default class Account extends React.Component {

  constructor(props) {
    super(props);

    this.canPurchase = !window.cordova;
  }

  render() {
    if (this.props.data.view.split('/')[1] == 'PURCHASE')
      return <Purchase {...this.props} />

    const { account } = this.props.data;

    return (
      <div className='account'>
        <Paper
          zDepth={1}
          component='section'
          className='referral-link section flex'
        >
          <h3>Referral Program</h3>
          <p>
            Refer new users to Xyfir Books and they'll receive 10% off of their first purchase.
            <br />
            You'll receive one month of subscription time whenever they purchase a year subscription.
          </p>

          <Button
            flat primary
            iconChildren='content_copy'
            onClick={() =>
              copy('https://books.xyfir.com/?r=user~' + account.uid)
            }
          >Copy Link</Button>
        </Paper>

        <Paper
          zDepth={1}
          component='section'
          className='subscription section'
        >
          <h3>Subscription</h3>

          {account.subscription > Date.now() ? (
            <div>
              <p>
                Your subscription will expire on {
                  moment(account.subscription).format('YYYY-MM-DD')
                }.

                <br />

                Your library size limit is {account.librarySizeLimit}GB.
              </p>

              {this.canPurchase ? (
                <Button
                  raised primary
                  onClick={() =>
                    location.hash = '#/account/purchase/subscription'
                  }
                >Purchase</Button>
              ) : (
                <p>Subscriptions must be purchased via xyBooks' website.</p>
              )}
            </div>
          ) : (
            <div>
              <p>
                You do not have a Xyfir Books subscription.

                <br />

                {account.subscription ? (
                  <span>
                    Your library will be deleted after {
                      moment(account.subscription)
                        .add(7, 'days')
                        .format('YYYY-MM-DD')
                    }.

                    <br />

                    Purchase a subscription to prevent your library from being deleted.
                  </span>
                ) : null}
              </p>

              {this.canPurchase ? (
                <Button
                  raised primary
                  onClick={() =>
                    location.hash = '#/account/purchase/subscription'
                  }
                >Purchase</Button>
              ) : (
                <p>Subscriptions must be purchased via xyBooks' website.</p>
              )}
            </div>
          )}
        </Paper>
      </div>
    );
  }

}