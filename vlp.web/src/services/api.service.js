import axios from 'axios';
import { errorMessages } from "../config/messages.config";
import { getApiUrl, getEndpointUrl } from "../config/api.config";
import { localStorageService } from "./localStorageService";
// import jwt from "jsonwebtoken";
import { history } from '../helpers/history';
import { PUBLIC_URL } from "../config/api.config";
// declare a request interceptor
axios.interceptors.request.use(
  request => {
    if (request.method.toUpperCase() === "POST") {
      request.headers["Content-Type"] = "application/json";
    }
    const isLoggedIn = localStorageService.isAuthenticated();
    let token = localStorageService.getAuthorizationToken();
    if (isLoggedIn || token) {
      const token = localStorageService.getAuthorizationToken();
      request.headers.Authorization = `Bearer ${token}`;
    }
    return request;
  },
  error => {
    return Promise.reject(error);
  }
);


//response interceptor to refresh token on receiving token expired error
axios.interceptors.response.use(
  (response) => {
    // console.log(response, 'in itercepter');
    // do something with the response data
    return Promise.resolve(response.data);
  },
  (error) => {
    // console.log(error, 'in interceptor error');
    // handle the response error
    const { response } = error;

    if (response) {
      const { status, data } = response;
      // place your reentry code
      if (status === 401) {
        const refreshToken = localStorageService.getRefreshToken();
        if (refreshToken) {
          const originalRequest = error.config;
          return axios
          .post(getApiUrl("REFRESHTOKEN"), { refreshToken: refreshToken })
          .then((res) => {
            if (res.Success) {
              localStorageService.storeAuthToken(res.Data.Token);
              localStorageService.storeRefreshToken(res.Data.RefreshToken);
              console.log("Access token refreshed!");
              return axios(originalRequest);
            }
          });
        } else {
          // TODO: Redirect to login 
        }
      } else {
        return Promise.reject(data.Message);
      }
    } else {
      // console.log(error);
      if (error.message === "Network Error") {
        return Promise.reject(errorMessages.API_NOT_AVAILABLE);
      } else {
        return Promise.reject(error.message);
      }
    }
  }
);


/* api methods */

const signin = (email, password, rememberme) => {
  return axios
    .post(getApiUrl("SIGNIN"), { email, password, rememberme })
    .then(response => {

      if (response.Success) {
        if (response.Data.IsStudent === "Y" && response.Data.IsTutor === "Y") {
          localStorageService.updateUserMode('student');
        }
        else {
          localStorageService.updateUserMode(response.Data.IsStudent === "Y" ? 'student' : 'tutor');
        }
        localStorageService.storeAuthUser(response, rememberme);
      }
      return response;
    });
};
const externalSignIn = (tokenId, providerName) => {
  return axios
    .post(getApiUrl("EXTERNALLOGIN"), { tokenId, providerName })
    .then(response => {
      if (response.Success) {
        if (response.Data.IsStudent === "Y" && response.Data.IsTutor === "Y") {
          localStorageService.updateUserMode('student');
        }
        else {
          localStorageService.updateUserMode(response.Data.IsStudent === "Y" ? 'student' : 'tutor');
        }
        localStorageService.storeAuthUser(response);
      }
      return response;
    });
}

const logout = () => {

  localStorageService.clearLocalStorage();
};

const get = endpoint => {
  return axios.get(getApiUrl(endpoint));
};

const getPaymentVerify = (endpoint, data) => {
  return axios.get(getApiUrl(endpoint), {params : data} );
};

const post = (endpoint, data) => {

  return axios.post(getApiUrl(endpoint), data);
};

const postAsync = async (endpoint, data) => {
  return await axios.post(getApiUrl(endpoint), data);
};

const postAltAsync = async (baseUrl, endpoint, data) => {
  return await axios.post(`${baseUrl}${getEndpointUrl(endpoint)}`, data);
};

const postFile = (endpoint, formData) => {
  return axios.post(getApiUrl(endpoint), formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};

// postDateRangeFilter
const postDateRange = data => {
  localStorageService.postDateRange(data);
};
//getDateRangeFilter
const getDateRange = () => {
  return JSON.parse(localStorageService.getDateRange());
};
export const apiService = {
  get,
  post,
  postAsync,
  postAltAsync,
  signin,
  logout,
  postFile,
  postDateRange,
  getDateRange,
  externalSignIn,
  getPaymentVerify
};
