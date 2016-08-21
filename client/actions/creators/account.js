import {
    PURCHASE_SUBSCRIPTION
} from "../types/account";

export function purchaseSubscription(subscription) {
    return {
        type: PURCHASE_SUBSCRIPTION, subscription
    };
};