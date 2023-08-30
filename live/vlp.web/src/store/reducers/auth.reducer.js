import * as types from '../types';
import { localStorageService } from '../../services/localStorageService';

const user = localStorageService.isAuthenticated() ? localStorageService.getUserDetail() : null;
const userMode = localStorageService.getUserMode();
const initialState = user ? { user, userMode: userMode, loggedIn: true } : { loggedIn: false };
const authReducer = (state = initialState, { type, payload }) => {
    switch (type) {
        case types.LOGIN_SUCCESS:
            return {
                user: payload,
                loggedIn: true
            };

        case types.LOGOUT:
            return {
                loggedIn: false
            };
        case types.CHANGE_USER_MODE:
            return {
                user: { ...state.user },
                userMode: payload,
                loggedIn: state.loggedIn
            };

        default:
            return state;
    }
}

export default authReducer;