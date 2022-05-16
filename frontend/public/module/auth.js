import * as _ from 'lodash-es';

import { coFetch, coFetchJSON } from '../co-fetch';
import { stripBasePath } from '../components/utils/link';

const loginState = key => (localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : null);

const loginStateItem = key => loginState(key);

const userID = 'userID';
const name = 'name';
const email = 'email';
const groups = 'groups';
const token = 'token';
const clearLocalStorageKeys = [userID, name, email, groups, token];

const setNext = next => {
  if (!next) {
    return;
  }

  try {
    // Don't redirect the user back to the error page after logging in.
    const path = stripBasePath(next);
    localStorage.setItem('next', path.startsWith('/error') ? '/' : path);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to next URL in localStorage', e);
  }
};

const clearLocalStorage = keys => {
  keys.forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to clear localStorage', e);
    }
  });
};

export const authSvc = {
  userID: () => loginStateItem(userID),
  name: () => loginStateItem(name),
  email: () => loginStateItem(email),
  groups: () => loginStateItem(groups),

  getUserIdGroupQueryParam: () => {
    const userIdParam = authSvc.name() ? `userId=${authSvc.name()}` : '';
    const userGroupParam = authSvc.groups()
      ? `&${authSvc
          .groups()
          .map(group => `userGroup=${group}`)
          .join('&')}`
      : '';
    return `${userIdParam}${userGroupParam}`;
  },

  // Avoid logging out multiple times if concurrent requests return unauthorized.
  logout: _.once(next => {
    setNext(next);
    clearLocalStorage(clearLocalStorageKeys);
    let redirectUrl = '';
    const realm = authSvc.getRealmUrl();
    if (realm) {
      redirectUrl = `${realm}/protocol/openid-connect/logout?redirect_uri=${encodeURIComponent(location.href)}`;
      window.location = `${location.origin}/oauth2/sign_out?rd=${redirectUrl}`;
    }
  }),

  // Extra steps are needed if this is OpenShift to delete the user's access
  // token and logout the kube:admin user.
  logoutOpenShift: (isKubeAdmin = false) => {
    return authSvc.deleteOpenShiftToken().then(() => {
      if (isKubeAdmin) {
        authSvc.logoutKubeAdmin();
      } else {
        authSvc.logout();
      }
    });
  },

  deleteOpenShiftToken: () => {
    return (
      coFetch('/api/openshift/delete-token', { method: 'POST' })
        // eslint-disable-next-line no-console
        .catch(e => console.error('Error deleting token', e))
    );
  },

  // The kube:admin user has a special logout flow. The OAuth server has a
  // session cookie that must be cleared by POSTing to the kube:admin logout
  // endpoint, otherwise the user will be logged in again immediately after
  // logging out.
  logoutKubeAdmin: () => {
    clearLocalStorage(clearLocalStorageKeys);
    // First POST to the console server to clear the console session cookie.
    coFetch(window.SERVER_FLAGS.logoutURL, { method: 'POST' })
      // eslint-disable-next-line no-console
      .catch(e => console.error('Error logging out', e))
      .then(() => {
        // We need to POST to the kube:admin logout URL. Since this is a
        // cross-origin request, use a hidden form to POST.
        const form = document.createElement('form');
        form.action = window.SERVER_FLAGS.kubeAdminLogoutURL;
        form.method = 'POST';

        // Redirect back to the console when logout is complete by passing a
        // `then` parameter.
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'then';
        input.value = window.SERVER_FLAGS.loginSuccessURL;
        form.appendChild(input);

        document.body.appendChild(form);
        form.submit();
      });
  },

  login: () => {
    coFetch('/oauth2/sign_in')
      // eslint-disable-next-line no-console
      .catch(e => console.error('Error logging in', e));
  },

  updateLocalStorage: userJSON => {
    localStorage.setItem(userID, JSON.stringify(userJSON.userID));
    localStorage.setItem(name, JSON.stringify(userJSON.name));
    localStorage.setItem(email, JSON.stringify(userJSON.email));
    localStorage.setItem(groups, JSON.stringify(userJSON.groups.split(',').filter(group => !group.startsWith('role:'))));
    localStorage.setItem(token, JSON.stringify(userJSON.token));
  },

  getRealmUrl: () => {
    if (window.SERVER_FLAGS.KeycloakAuthURL) {
      if (window.SERVER_FLAGS.KeycloakAuthURL.charAt(window.SERVER_FLAGS.KeycloakAuthURL.length - 1) == '/') {
        return `${window.SERVER_FLAGS.KeycloakAuthURL}realms/${encodeURIComponent(window.SERVER_FLAGS.KeycloakRealm)}`;
      } else {
        return `${window.SERVER_FLAGS.KeycloakAuthURL}/realms/${encodeURIComponent(window.SERVER_FLAGS.KeycloakRealm)}`;
      }
    } else {
      return undefined;
    }
  },

  createAccountUrl: () => {
    const realm = authSvc.getRealmUrl();
    let url = undefined;
    if (realm) {
      url = `${realm}/account?referrer=${encodeURIComponent(window.SERVER_FLAGS.KeycloakClientId)}&referrer_uri=${encodeURIComponent(location.href)}`;
    }
    return url;
  },
};
