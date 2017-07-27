import moment from 'moment';
import React from 'react';
import copy from 'copyr';

// react-md
import Button from 'react-md/lib/Buttons/Button';
import Paper from 'react-md/lib/Papers';

// Components
import Purchase from 'components/account/purchase/Purchase';

export default class Account extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      useNative: localStorage.isPhoneGap == 'true'
    }
  }

  render() {
    if (this.props.data.view.split('/')[1] == 'PURCHASE')
      return <Purchase {...this.props} useNative={this.state.useNative} />
    
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
            You'll receive one week of subscription time for every month that they purchase.
          </p>

          <Button
            flat primary
            label='Copy Link'
            onClick={() => copy('https://books.xyfir.com/#?r=' + account.uid)}
          >content_copy</Button>
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

                Your library size limit is {account.librarySizeLimit}GB
              </p>
              
              <Button
                raised primary
                label='Extend'
                onClick={() =>
                  location.hash = '#account/purchase/extend-subscription'
                }
              />

              {!this.state.useNative ? (
                <Button
                  raised secondary
                  label='Limit'
                  onClick={() =>
                    location.hash = '#account/purchase/increase-size-limit'
                  }
                />
              ) : null}
            </div>
          ) : (
            <div>
              <p>
                You do not have a Xyfir Books subscription.
                
                <br />

                {account.library != '' ? (
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
              
              <Button
                raised primary
                label='Purchase'
                onClick={() => location.hash = '#account/purchase/subscription'}
              />
            </div>
          )}
        </Paper>
      </div>
    );
  }    

}