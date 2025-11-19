/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, join, put, select, spawn, take } from 'redux-saga/effects';
import { jwtDecode } from 'jwt-decode';

import selectors from '../../selectors';
import entryActions from '../../entry-actions';
import ErrorCodes from '../../constants/ErrorCodes';
import { log } from '../../utils/logger';

let lastRequestTask;

function* queueRequest(method, ...args) {
  if (lastRequestTask) {
    try {
      yield join(lastRequestTask);
    } catch {
      /* empty */
    }
  }

  const accessToken = yield select(selectors.selectAccessToken);
  log('request', 'queueRequest: accessToken exists?', !!accessToken);

  if (!accessToken) {
    log('request', 'queueRequest: no accessToken, throwing UNAUTHORIZED');
    const error = new Error('Access token is missing');
    error.code = ErrorCodes.UNAUTHORIZED;
    throw error;
  }

  try {
    // Check if token is expired
    try {
      const decoded = jwtDecode(accessToken);
      const now = Math.floor(Date.now() / 1000);
      const isExpired = decoded.exp < now;
      log('request', 'queueRequest: token check', {
        exp: decoded.exp,
        now,
        isExpired,
        expiresIn: decoded.exp - now,
      });
      if (isExpired) {
        log('request', 'queueRequest: token expired, logging out');
        yield put(entryActions.logout(false));
        yield take();
        const expiredError = new Error('Access token expired');
        expiredError.code = ErrorCodes.UNAUTHORIZED;
        throw expiredError;
      }
    } catch (decodeError) {
      log('request', 'queueRequest: failed to decode token', decodeError);
    }

    log('request', 'queueRequest: making request with token');
    const result = yield call(method, ...args, {
      Authorization: `Bearer ${accessToken}`,
    });
    log('request', 'queueRequest: request successful');
    return result;
  } catch (error) {
    log('request', 'queueRequest: error', error.code, error.message, error);
    if (error.code === ErrorCodes.UNAUTHORIZED) {
      log('request', 'queueRequest: UNAUTHORIZED error, logging out');
      yield put(entryActions.logout(false));
      yield take();
    }

    throw error;
  }
}

export default function* request(method, ...args) {
  lastRequestTask = yield spawn(queueRequest, method, ...args);

  return yield join(lastRequestTask);
}
