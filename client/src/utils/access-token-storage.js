/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

import Config from '../constants/Config';
import { log } from './logger';

export const setAccessToken = (accessToken) => {
  const { exp } = jwtDecode(accessToken);
  const expires = new Date(exp * 1000);

  Cookies.set(Config.ACCESS_TOKEN_KEY, accessToken, {
    expires,
    secure: window.location.protocol === 'https:',
    sameSite: 'strict',
  });

  Cookies.set(Config.ACCESS_TOKEN_VERSION_KEY, Config.ACCESS_TOKEN_VERSION, {
    expires,
  });
};

export const removeAccessToken = () => {
  Cookies.remove(Config.ACCESS_TOKEN_KEY);
  Cookies.remove(Config.ACCESS_TOKEN_VERSION_KEY);
};

export const getAccessToken = () => {
  let accessToken = Cookies.get(Config.ACCESS_TOKEN_KEY);
  const accessTokenVersion = Cookies.get(Config.ACCESS_TOKEN_VERSION_KEY);

  log('access-token-storage', 'getAccessToken:', {
    hasToken: !!accessToken,
    tokenVersion: accessTokenVersion,
    expectedVersion: Config.ACCESS_TOKEN_VERSION,
    versionsMatch: accessTokenVersion === Config.ACCESS_TOKEN_VERSION,
  });

  if (accessToken && accessTokenVersion !== Config.ACCESS_TOKEN_VERSION) {
    log('access-token-storage', 'getAccessToken: version mismatch, removing token');
    removeAccessToken();
    accessToken = undefined;
  }

  return accessToken;
};
