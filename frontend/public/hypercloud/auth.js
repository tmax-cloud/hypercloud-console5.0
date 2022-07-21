import * as _ from 'lodash-es';
import store from '../redux';
import { coFetchJSON } from '../co-fetch';
import { setUser } from '@console/internal/actions/common';

export const REQUEST_TOKEN_REFRESH_URL = '/oauth2/token';
export const REQUEST_TOKEN_INFO_URL = '/oauth2/tokeninfo';

export const REQUEST_ACCOUNT_USERS_URL = '/oauth2/user/list';
export const REQUEST_ACCOUNT_GROUPS_URL = '/oauth2/group/list';

const id = 'id';
const email = 'email';
const groups = 'groups';
const accountUrl = 'accountUrl';
const expireTime = 'expireTime';
const clearSessionStorageKeys = [id, email, groups, accountUrl, expireTime];

export const getId = function() {
  return sessionStorage.getItem(id);
};

const getGroups = () => {
  try {
    return JSON.parse(sessionStorage.getItem(groups));
  } catch (error) {
    return null;
  }
};

export const getUserGroup = function() {
  const usergroups = getGroups();
  let result = '';
  if (usergroups?.length > 0) {
    result = '&' + usergroups.map(cur => `userGroup=${cur}`).join('&');
  }
  return result;
};

export const getAuthUrl = function() {
  return sessionStorage.getItem(accountUrl);
};

export const createAccountUrl = () => {
  const realm = getAuthUrl();
  let url;
  if (realm) {
    url = `${realm}/account?referrer=${encodeURIComponent(window.SERVER_FLAGS.KeycloakClientId)}&referrer_uri=${encodeURIComponent(location.href)}`;
  }
  return url;
};

/* NOT USED
export const setAccessToken = function(token) {
  sessionStorage.setItem('accessToken', token);
  return;
};

export const getAccessToken = function() {
  return sessionStorage.getItem('accessToken');
};
*/

// 로그아웃 시 사용
export const resetLoginState = function() {
  clearSessionStorageKeys.forEach(key => {
    try {
      sessionStorage.removeItem(key);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to clear sessionStorage', e);
    }
  });
};

/* NOT USED
const decodeAccessToken = () => {
  const token = getAccessToken();
  if (!token) {
    return null;
  }
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(''),
  );

  return JSON.parse(jsonPayload);
};
*/

const fetchUserinfo = async () => {
  try {
    const res = await coFetchJSON(REQUEST_TOKEN_INFO_URL);
    const { sessionInfo, token } = res;
    return { sessionInfo, token };
  } catch (err) {
    console.error('Failed to fetch user info ', err);
    return null;
  }
};

const fetchTokenExpireTime = async () => {
  try {
    const res = await coFetchJSON(REQUEST_TOKEN_INFO_URL);
    return res?.token?.exp;
  } catch (err) {
    console.error('Failed to fetch token expiration time ', err);
    return null;
  }
};

const refreshToken = async () => {
  try {
    const res = await coFetchJSON(REQUEST_TOKEN_REFRESH_URL);
  } catch (error) {
    console.error('Failed to refresh the token ', error);
  }
};

export const tokenRefresh = () => {
  return new Promise(async (resolve, reject) => {
    try {
      await refreshToken();
      const _expireTime = await fetchTokenExpireTime();
      if (!_expireTime) {
        console.error('Failed to get token expiration time ');
        return;
      }
      sessionStorage.setItem(expireTime, _expireTime);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

export const detectUser = () => {
  return new Promise(async (resolve, reject) => {
    try {
      await refreshToken();
      const info = await fetchUserinfo();
      if (!info) {
        logout();
        return;
      }
      resetLoginState();
      const { token } = info;
      sessionStorage.setItem(id, token?.preferred_username);
      sessionStorage.setItem(email, token?.email);
      sessionStorage.setItem(groups, JSON.stringify(token?.groups));
      sessionStorage.setItem(accountUrl, token?.iss);
      sessionStorage.setItem(expireTime, token?.exp);
      store.dispatch(setUser({ id: sessionStorage.getItem(id), email: sessionStorage.getItem(email), groups: sessionStorage.getItem(groups) }));
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

export const getLogoutTime = () => {
  const curTime = new Date();
  const tokenExpTime = new Date((sessionStorage.getItem(expireTime) || 0) * 1000);
  const logoutTime = (tokenExpTime.getTime() - curTime.getTime()) / 1000;
  return logoutTime < 0 ? 0 : logoutTime;
};

// 여러번 로그아웃되지 않도록 함
export const logout = _.once(() => {
  const realm = getAuthUrl();
  if (realm) {
    resetLoginState();
    const redirectUrl = `${realm}/protocol/openid-connect/logout?redirect_uri=${encodeURIComponent(location.origin)}`;
    window.location = `${location.origin}/oauth2/sign_out?rd=${redirectUrl}`;
  }
});
