import { PURCHASE_SUBSCRIPTION } from "../actions/types/account/subscription";

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