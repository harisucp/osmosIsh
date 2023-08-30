import * as types from '../types';
import { localStorageService } from '../../services/localStorageService';
const userTimeZone = localStorageService.getUserTimeZone();
const initialState = { userTimezone: userTimeZone };

const timezoneReducer = (state = initialState, { type, payload }) => {
    switch (type) {
        case types.TIMEZONE_UPDATE:
            return {
                userTimezone: payload
            };
        default:
            return state;
    }
}
export default timezoneReducer;