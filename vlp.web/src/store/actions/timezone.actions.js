import * as types from "../types";

export const updateTimezone = (data) => {
    return { type: types.TIMEZONE_UPDATE, payload: data };
};
