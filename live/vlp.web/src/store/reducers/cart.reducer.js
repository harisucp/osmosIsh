import * as types from '../types';
import { localStorageService } from '../../services/localStorageService';

const cartCount = localStorageService.getCartItemCount()
const initialState = { cartCount: cartCount > 0 ? cartCount : 0 };

const cartReducer = (state = initialState, { type, payload }) => {
    
    switch (type) {
        case types.CART_COUNT_UPDATE:
            localStorageService.storeCartItemCount(payload);
            return {
                cartCount: payload,
            };
        case types.INCREEMENT_CART:
            localStorageService.storeCartItemCount(Number(state.cartCount) + payload);
            return { cartCount: Number(state.cartCount) + payload };
        case types.DECREEMENT_CART:
            localStorageService.storeCartItemCount(Number(state.cartCount) - payload);
            return { cartCount: Number(state.cartCount) - payload }
        default:
            return state;
    }
}
export default cartReducer;