import React from "react";

// Components
import StripePurchaseSubscription from "./purchase/stripe/Subscription";
import StripeExtendSubscription from "./purchase/stripe/ExtendSubscription";
import StripeIncreaseSizeLimit from "./purchase/stripe/IncreaseSizeLimit";
import NativePurchase from "./purchase/native/Purchase";

// Constants
import {
    PURCHASE_SUBSCRIPTION, EXTEND_SUBSCRIPTION, INCREASE_SIZE_LIMIT
} from "constants/views";

export default class Purchase extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.useNative) return <NativePurchase {...this.props} />;

        switch (this.props.data.view) {
            case PURCHASE_SUBSCRIPTION:
                return <StripePurchaseSubscription {...this.props} />;
            case EXTEND_SUBSCRIPTION:
                return <StripeExtendSubscription {...this.props} />;
            case INCREASE_SIZE_LIMIT:
                return <StripeIncreaseSizeLimit {...this.props} />;
        }
    }    

}