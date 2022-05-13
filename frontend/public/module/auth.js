import * as _ from 'lodash-es';

import { coFetch, coFetchJSON } from '../co-fetch';
import { stripBasePath } from '../components/utils/link';

const loginState = key => (localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : null);

const loginStateItem = key => loginState(key);

const userID = 'userID';
const name = 'name';
const email = 'email';
const groups = 'groups';
const clearLocalStorageKeys = [userID, name, email, groups];

// TODO: [YUNHEE] TEST 용
window.SERVER_FLAGS.loginURL = '/oauth2/sign_in';
window.SERVER_FLAGS.logoutURL = '/oauth2/sign_out';

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
    const userIdParam = loginStateItem(name) ? `userId=${loginStateItem(name)}` : '';
    const userGroupParam = loginStateItem(groups)
      ? `&${loginStateItem(groups)
          .map(group => `userGroup=${group}`)
          .join('&')}`
      : '';
    return `${userIdParam}${userGroupParam}`;
  },

  // Avoid logging out multiple times if concurrent requests return unauthorized.
  logout: _.once(next => {
    setNext(next);
    clearLocalStorage(clearLocalStorageKeys);
    coFetch(window.SERVER_FLAGS.logoutURL, { method: 'POST' })
      // eslint-disable-next-line no-console
      .catch(e => console.error('Error logging out', e));
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
    coFetch(window.SERVER_FLAGS.loginURL, { method: 'POST' })
      // eslint-disable-next-line no-console
      .catch(e => console.error('Error logging in', e));
  },

  isLoggedIn: () => {
    return new Promise(resolve => {
      coFetch('/oauth2/auth')
        .then(() => resolve(true))
        .catch(resolve(false));
    });
  },

  getUserInfo: () => {
    coFetchJSON('/oauth2/userinfo')
      .then(res => {
        localStorage.setItem(userID, JSON.stringify(res.user));
        localStorage.setItem(name, JSON.stringify(res.preferredUsername));
        localStorage.setItem(email, JSON.stringify(res.email));
        localStorage.setItem(groups, JSON.stringify(res.groups.filter(group => !group.startsWith('role:'))));
      })
      // eslint-disable-next-line no-console
      .catch(e => console.error('Fail to get userinfo', e));
  },
};
