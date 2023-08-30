import * as types from '../types';

const initialState = {search:'', performSearch: false };
const commonReducer = (state = initialState, { type, payload }) => {
    
    switch (type) {
        case types.SEARCH_TEXT:
            return {
                search: payload,
                performSearch: false 
            };
            case types.RESET_SEARCH_TEXT:
            return {
                search: payload,
                performSearch: false
            };
            case types.PERFORM_SEARCH:
            return {
                ...state,
                performSearch: payload 
            };
            
        default:
            return state;
    }
}

export default commonReducer;