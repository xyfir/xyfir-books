import { Button, Paper } from 'react-md';
import moment from 'moment';
import React from 'react';
import copy from 'copyr';

// Components
import Purchase from 'components/account/Purchase';

const PurchaseButton = () => (
  <Button
    raised primary
    onClick={() => location.hash = '#/account/purchase/subscription'}
  >Purchase</Button>
);

export default class Account extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const {view, account} = this.props.App.state;

    if (view.split('/')[1] == 'PURCHASE') return <Purchase {...this.props} />

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
            <React.Fragment>
              <p>
                Your subscription will expire on {
                  moment(account.subscription).format('YYYY-MM-DD')
                }.
              </p>

              <p>Your library size limit is {account.librarySizeLimit}GB.</p>

              <PurchaseButton />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <p>You do not have a Xyfir Books subscription.</p>

                {account.subscription ? (
                  <React.Fragment>
                    <p>
                      Your library will be deleted after {
                        moment(account.subscription)
                          .add(7, 'days')
                          .format('YYYY-MM-DD')
                      }.
                    </p>
                    <p>
                      Purchase a subscription to prevent your library from being deleted.
                    </p>
                  </React.Fragment>
                ) : null}

              <PurchaseButton />
            </React.Fragment>
          )}
        </Paper>
      </div>
    );
  }

}