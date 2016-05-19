import {
    PURCHASE_SUBSCRIPTION, SET_LIBRARY_ADDRESS
} from "../actions/types/account";

export default function(state, action) {
    switch (action.type) {
        case PURCHASE_SUBSCRIPTION:
            return Object.assign({}, state, {
                subscription: action.subscription
            });
            
        default:
            return state;
    }
}