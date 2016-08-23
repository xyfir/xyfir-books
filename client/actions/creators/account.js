import {
    PURCHASE_SUBSCRIPTION, SET_LIBRARY_SIZE_LIMIT
} from "../types/account";

export function purchaseSubscription(subscription) {
    return {
        type: PURCHASE_SUBSCRIPTION, subscription
    };
}

export function setLibrarySizeLimit(size) {
    return {
        type: SET_LIBRARY_SIZE_LIMIT, size
    };
}