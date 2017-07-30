import React from 'react';

// Components
import PurchaseSubscription from 'components/account/purchase/Subscription';
import ExtendSubscription from 'components/account/purchase/ExtendSubscription';
import IncreaseSizeLimit from 'components/account/purchase/IncreaseSizeLimit';

// Constants
import {
  PURCHASE_SUBSCRIPTION, EXTEND_SUBSCRIPTION, INCREASE_SIZE_LIMIT,
  XYANNOTATIONS_PURCHASE
} from 'constants/views';

export default class Purchase extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    switch (this.props.data.view) {
      case PURCHASE_SUBSCRIPTION:
        return <StripePurchaseSubscription {...this.props} />
      case EXTEND_SUBSCRIPTION:
        return <StripeExtendSubscription {...this.props} />
      case INCREASE_SIZE_LIMIT:
        return <StripeIncreaseSizeLimit {...this.props} />
    }
  }    

}