/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, select } from 'redux-saga/effects';

import loginSaga from './login';
import coreSaga from './core';
import selectors from '../selectors';
import { log } from '../utils/logger';

export default function* rootSaga() {
  const accessToken = yield select(selectors.selectAccessToken);
  log('rootSaga', 'accessToken exists?', !!accessToken);

  if (!accessToken) {
    log('rootSaga', 'no accessToken, starting loginSaga');
    yield call(loginSaga);
  } else {
    log('rootSaga', 'accessToken exists, skipping loginSaga');
  }

  log('rootSaga', 'starting coreSaga');
  yield call(coreSaga);
}
