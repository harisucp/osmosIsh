import * as types from "../types";

export const searchText = (data) => {
    
    return { type: types.SEARCH_TEXT, payload: data };
};

export const resetSearchText = (data) => {
    
    return { type: types.RESET_SEARCH_TEXT, payload: data };
}


export const performSearch = (data) => {
    
    return { type: types.PERFORM_SEARCH, payload: data };
};