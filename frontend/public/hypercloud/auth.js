import * as _ from 'lodash-es';
import { coFetch } from '@console/internal/co-fetch';
import { getIdToken as _getIdToken, getRefereshToken as _getRefreshToken } from '@console/internal/actions/ui';

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
  return decodeIdToken().iss || '';
};

export const getIdToken = () => {
  return _getIdToken();
};

export const getRefreshToken = () => {
  return _getRefreshToken();
};

export const setAccessToken = function(token) {
  sessionStorage.setItem('accessToken', token);
  return;
};

export const getAccessToken = function() {
  return sessionStorage.getItem('accessToken');
};

// 로그아웃 시 사용
export const resetLoginState = function() {
  sessionStorage.clear();
  return;
};

export const updateUserSessionStorage = userJSON => {
  sessionStorage.setItem('id', userJSON.id);
  sessionStorage.setItem('email', userJSON.email);
  sessionStorage.setItem('groups', JSON.stringify(userJSON.groups));
  // TODO [YUNHEE]: accessToken, refreshToken 정보 필요
};

export const decodeIdToken = function() {
  const token = getIdToken();
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(''),
  );

  return JSON.parse(jsonPayload);
};

export const createAccountUrl = () => {
  const realm = getAuthUrl();
  let url;
  if (realm) {
    url = `${realm}/account?referrer=${encodeURIComponent(window.SERVER_FLAGS.KeycloakClientId)}&referrer_uri=${encodeURIComponent(location.href)}`;
  }
  return url;
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
