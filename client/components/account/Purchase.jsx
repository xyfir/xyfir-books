import React from 'react';

// Components
import StripePurchaseSubscription from 'components/account/purchase/stripe/Subscription';
import StripeExtendSubscription from 'components/account/purchase/stripe/ExtendSubscription';
import StripeIncreaseSizeLimit from 'components/account/purchase/stripe/IncreaseSizeLimit';
import NativePurchase from 'components/account/purchase/native/Purchase';

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
    if (this.props.useNative) return <NativePurchase {...this.props} />

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