import { combineReducers } from 'redux';
import authReducer from './auth.reducer';
import alertReducer from './alert.reducer';
import cartReducer from './cart.reducer';
import timezoneReducer from "./timezone.reducer";
import commonReducer from "./common.reducer";

// import usermodeReducer from './usermode.reducer';

const rootReducer = combineReducers({
    alert: alertReducer,
    auth: authReducer,
    cart: cartReducer,
    timezone: timezoneReducer,
    common:commonReducer
});


export default rootReducer;