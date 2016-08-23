import React from "react";

// Components
import PurchaseSubscription from "./Subscription";
import ExtendSubscription from "./ExtendSubscription";
import IncreaseSizeLimit from "./IncreaseSizeLimit";

// Constants
import {
    PURCHASE_SUBSCRIPTION, EXTEND_SUBSCRIPTION, INCREASE_SIZE_LIMIT
} from "constants/views";

export default class Purchase extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        switch (this.props.data.view) {
            case PURCHASE_SUBSCRIPTION:
                return <PurchaseSubscription {...this.props} />;
            case EXTEND_SUBSCRIPTION:
                return <ExtendSubscription {...this.props} />;
            case INCREASE_SIZE_LIMIT:
                return <IncreaseSizeLimit {...this.props} />;
        }
    }    

}