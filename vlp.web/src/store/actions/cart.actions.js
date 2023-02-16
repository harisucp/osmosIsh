import * as types from "../types";

export const updateCart = (data) => {
    return { type: types.CART_COUNT_UPDATE, payload: data };
};

export const increementCart = (data) => {
    return { type: types.INCREEMENT_CART, payload: data };
}

export const decreementCart = (data) => {
    return { type: types.DECREEMENT_CART, payload: data };
}
