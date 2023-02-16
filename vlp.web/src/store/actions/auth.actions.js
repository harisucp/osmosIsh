import * as types from "../types";

export const loginSuccess = (data) => {
    return { type: types.LOGIN_SUCCESS, payload: data};
};

export const logout = () => {
    return { type: types.LOGOUT, payload: {} }
};

export const changeUserMode = (data) => {
    return { type: types.CHANGE_USER_MODE, payload: data };
};
