import { TIMEOUT_IN_MINUTES, TIMEOUT_IN_DAYS } from "../config/api.config";
import moment from 'moment';

const LOCALSTORAGE_AUTH_USER = "AuthUser";
const LOCALSTORAGE_TOKEN_KEY = "AuthToken";
const LOCALSTORAGE_REFRESH_TOKEN_KEY = "RefreshToken";
const LOCALSTORAGE_EXPIRES_AT = "ExpiresAt";
const LOCALSTORAGE_REMEMBER_ME = "RememberMe";
const LOCALSTORAGE_CARTITEM = "CartItems";
const LOCALSTORAGE_CART_COUNT = "CartCount";
const LOCALSTORAGE_USER_MODE = "UserMode";
const LOCALSTORAGE_USER_TIMEZONE = "Timezone";
const LOCALSTORAGE_LOGGEDIN_STATUS = "LoggedIn";
const LOCALSTORAGE_USER_LOCAL_TIME = "LocalTime";
const LOCALSTORAGE_CALENDER_CARTITEM = "CalendarCartItems";


const getUserDetail = () => {

  let userDetailData = localStorage.getItem(LOCALSTORAGE_AUTH_USER);

  if (userDetailData) return JSON.parse(userDetailData);

  return null;
};

const storeAuthToken = token => {
  localStorage.setItem(LOCALSTORAGE_TOKEN_KEY, token);
};


const storeRefreshToken = token => {
  localStorage.setItem(LOCALSTORAGE_REFRESH_TOKEN_KEY, token);
};

const storeCartItemCount = count => {
  localStorage.setItem(LOCALSTORAGE_CART_COUNT, count);
};

const getCartItemCount = () => {

  return localStorage.getItem(LOCALSTORAGE_CART_COUNT);
};
const getMyCartItemCount = () => {
  let cartItems = localStorageService.fetchCartItem();
  if (Object.keys(cartItems).lenght > 0) {
    cartItems = cartItems.filter(x => x.IsSavedForLater === "N");
  }
  return cartItems;
};

const removeAuthToken = () => {
  localStorage.removeItem(LOCALSTORAGE_TOKEN_KEY);
};

const removeRefreshToken = () => {
  localStorage.removeItem(LOCALSTORAGE_REFRESH_TOKEN_KEY);
};

const getAuthorizationToken = () => {
  return localStorage.getItem(LOCALSTORAGE_TOKEN_KEY);
};


const getRefreshToken = () => {
  return localStorage.getItem(LOCALSTORAGE_REFRESH_TOKEN_KEY);
};

const isAuthenticated = () => {
  if (localStorage.getItem(LOCALSTORAGE_AUTH_USER)) {
    if (localStorage.getItem(LOCALSTORAGE_EXPIRES_AT)) {
      if (IsPasswordActive()) {
        return true;
      } else {
        clearLocalStorage();
        return false;
      }
    } else {
      return true;
    }
  }
  return false;
};

const storeAuthUser = (data, remember = false) => {
  storeAuthToken(data.Data.Token);
  storeRefreshToken(data.Data.RefreshToken);
  
  storeCartItemCount(data.Data.EnrollmentCount > 0 ? data.Data.EnrollmentCount : 0);
  updateLoggedInStatus(true);
  delete data.Data.Token;
  delete data.Data.EnrollmentCount;
  localStorage.setItem(LOCALSTORAGE_AUTH_USER, JSON.stringify(data.Data));
  if (remember === true) {
    SetExpiresAtInDays();
  } else {
    SetExpiresAtInMinutes();
  }
};

const updateAuthUser = (firstName, lastName, userImage, mode) => {
  
  let authData = getUserDetail();
  authData["FirstName"] = firstName;
  authData["LastName"] = lastName;
  authData["UserImage"] = userImage;
  if(mode && mode == "tutor")
  {
    authData["IsProfileUpdated"] = 'Y';
  }
  localStorage.setItem(LOCALSTORAGE_AUTH_USER, JSON.stringify(authData));
}
// local storage cart---------------
const storeCartItem = (data) => {
  let items = fetchCartItem();
  items = items === null ? [] : items;
  let count = items === null ? 0 : Object.keys(items).length;
  data.EnrollmentId = count + 1;
  items[count] = data;
  localStorage.setItem(LOCALSTORAGE_CARTITEM, JSON.stringify(items));
  storeCartItemCount(count + 1);
}

const storeCalendarCartItem = (data) => {
  localStorage.removeItem(LOCALSTORAGE_CALENDER_CARTITEM);
  localStorage.setItem(LOCALSTORAGE_CALENDER_CARTITEM, JSON.stringify(data));
}

const getCalendarCartItem = () => {
  return JSON.parse(localStorage.getItem(LOCALSTORAGE_CALENDER_CARTITEM));
}

const checkCartItem = (id, type) => {
  let items = [];
  let count = [];
  items = fetchCartItem();
  if (items !== null) {
    if (type === "series") {
      count = items.filter(x => x.SeriesId === parseInt(id));
    }
    else {
      count = items.filter(x => x.SessionId === parseInt(id));
    }
  }
  return Object.keys(count).length > 0 ? true : false;
}

const updateCartItemStatus = (data) => {
  localStorage.setItem(LOCALSTORAGE_CARTITEM, JSON.stringify(data));
}
const fetchCartItem = () => {
  return JSON.parse(localStorage.getItem(LOCALSTORAGE_CARTITEM));
}

const getLocalCartItemCount = () => {

  let items = JSON.parse(localStorage.getItem(LOCALSTORAGE_CARTITEM));
  return items !== null && Object.keys(items).length > 0 ? Object.keys(items).length : 0;

}

const removeCartItemsFromLocal = () => {
  localStorage.removeItem(LOCALSTORAGE_CARTITEM);
}
// local storage cart-------------------
const isRememberMeChecked = () => {
  return localStorage.getItem(LOCALSTORAGE_REMEMBER_ME) ? true : false;
};

const clearLocalStorage = () => {
  localStorage.removeItem(LOCALSTORAGE_AUTH_USER);
  localStorage.removeItem(LOCALSTORAGE_TOKEN_KEY);
  localStorage.removeItem(LOCALSTORAGE_EXPIRES_AT);
  localStorage.removeItem(LOCALSTORAGE_REMEMBER_ME);
  localStorage.removeItem(LOCALSTORAGE_CARTITEM);
  localStorage.removeItem(LOCALSTORAGE_CART_COUNT);
  localStorage.removeItem(LOCALSTORAGE_USER_MODE);
  updateLoggedInStatus(false);
};
const updateLoggedInStatus = (status) => {
  localStorage.setItem(LOCALSTORAGE_LOGGEDIN_STATUS, status);

}

const SetExpiresAtInMinutes = (TimeOutMinutes) => {
  var minutes = TIMEOUT_IN_MINUTES !== undefined ? TIMEOUT_IN_MINUTES : TimeOutMinutes;
  var expiryMiliseconds = moment(new Date()).add(minutes, 'm').toDate().getTime();
  localStorage.setItem(LOCALSTORAGE_EXPIRES_AT, String(expiryMiliseconds));
};

const SetExpiresAtInDays = () => {
  var expiryMiliseconds = moment(new Date()).add(TIMEOUT_IN_DAYS, 'd').toDate().getTime();
  localStorage.setItem(LOCALSTORAGE_EXPIRES_AT, String(expiryMiliseconds));
  localStorage.setItem(LOCALSTORAGE_REMEMBER_ME, "true");
};

const IsPasswordActive = () => {
  const expirtyTime = Number(localStorage.getItem(LOCALSTORAGE_EXPIRES_AT));
  const currentTime = new Date().getTime();
  if (expirtyTime > currentTime) {
    return true;
  } else {
    return false;
  }
};
const updateUserMode = (userMode) => {
  localStorage.setItem(LOCALSTORAGE_USER_MODE, userMode);
};

const getUserMode = () => {
  return localStorage.getItem(LOCALSTORAGE_USER_MODE);
};

const setUserTimeZone = (timezone) => {
  var tzone = timezone;
  if (Number(timezone) > -14) {
    tzone = `UTC${timezone}`
  }
  localStorage.setItem(LOCALSTORAGE_USER_TIMEZONE, tzone);
};

const getUserTimeZone = () => {
  return localStorage.getItem(LOCALSTORAGE_USER_TIMEZONE);
};

const setCurrentTime = (localTime) => {
  localStorage.setItem(LOCALSTORAGE_USER_LOCAL_TIME, localTime);
}
const getCurrentTime = () => {
  return localStorage.getItem(LOCALSTORAGE_USER_LOCAL_TIME);
}

export const localStorageService = {
  getUserDetail,
  getAuthorizationToken,
  isAuthenticated,
  storeAuthUser,
  clearLocalStorage,
  storeAuthToken,
  removeAuthToken,
  isRememberMeChecked,
  SetExpiresAtInMinutes,
  SetExpiresAtInDays,
  IsPasswordActive,
  storeCartItem,
  fetchCartItem,
  checkCartItem,
  updateCartItemStatus,
  getCartItemCount,
  getLocalCartItemCount, //non- signed in mode
  removeCartItemsFromLocal,
  storeCartItemCount,
  updateUserMode,
  getUserMode,
  getMyCartItemCount,
  updateAuthUser,
  setUserTimeZone,
  getUserTimeZone,
  updateLoggedInStatus,
  setCurrentTime,
  getCurrentTime,

  storeRefreshToken,
  getRefreshToken,
  removeAuthToken,

  storeCalendarCartItem,
  getCalendarCartItem,

};
