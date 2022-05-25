import * as _ from 'lodash-es';
import { setUser } from '@console/internal/actions/common';

export const REQUEST_USERINFO_URL = '/oauth2/auth';

export const getId = function() {
  return sessionStorage.getItem('id');
};

const getGroups = () => {
  try {
    return JSON.parse(sessionStorage.getItem('groups'));
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
  return decodeAccessToken()?.iss || '';
};

export const createAccountUrl = () => {
  const realm = getAuthUrl();
  let url;
  if (realm) {
    url = `${realm}/account?referrer=${encodeURIComponent(window.SERVER_FLAGS.KeycloakClientId)}&referrer_uri=${encodeURIComponent(location.href)}`;
  }
  return url;
};

export const getTokenExpTime = () => {
  return decodeAccessToken()?.exp;
};

export const setAccessToken = function(token) {
  sessionStorage.setItem('accessToken', token);
  return;
};

export const getAccessToken = function() {
  return sessionStorage.getItem('accessToken');
};

export const setId = function(id) {
  sessionStorage.setItem('id', id);
  return;
};

// 로그아웃 시 사용
export const resetLoginState = function() {
  sessionStorage.clear();
  return;
};

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

const updateUserSessionStorage = userJSON => {
  sessionStorage.setItem('id', userJSON.id);
  sessionStorage.setItem('email', userJSON.email);
  sessionStorage.setItem('groups', JSON.stringify(userJSON.groups));
};

export const dispatchUser = (accessToken, dispatch) => {
  setAccessToken(accessToken);
  const decodeToken = decodeAccessToken();
  const user = { id: decodeToken.preferred_username, email: decodeToken.email, groups: decodeToken.groups };
  updateUserSessionStorage(user);
  dispatch(setUser(user));
};

export const getLogoutTime = () => {
  const curTime = new Date();
  const tokenExpTime = new Date((getTokenExpTime() || 0) * 1000);
  const logoutTime = (tokenExpTime.getTime() - curTime.getTime()) / 1000;
  return logoutTime < 0 ? 0 : logoutTime;
};

// 여러번 로그아웃되지 않도록 함
export const logout = _.once(() => {
  const realm = getAuthUrl();
  if (realm) {
    resetLoginState();
    const redirectUrl = `${realm}/protocol/openid-connect/logout?redirect_uri=${encodeURIComponent(location.href)}`;
    window.location = `${location.origin}/oauth2/sign_out?rd=${redirectUrl}`;
  }
});
