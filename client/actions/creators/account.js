import {
    PURCHASE_SUBSCRIPTION, SET_LIBRARY_ADDRESS
} from "../../types/account";

export function purchaseSubscription(subscription) {
    return {
        type: PURCHASE_SUBSCRIPTION, subscription
    };
};

export function setLibraryAddress(address) {
    return {
        type: SET_LIBRARY_ADDRESS, address
    };
}