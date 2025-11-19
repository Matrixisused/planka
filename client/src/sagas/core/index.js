/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { apply, fork, select, take } from 'redux-saga/effects';

import watchers from './watchers';
import services from './services';
import runWatchers from '../run-watchers';
import selectors from '../../selectors';
import { socket } from '../../api';
import ActionTypes from '../../constants/ActionTypes';
import Paths from '../../constants/Paths';
import { log } from '../../utils/logger';

export default function* coreSaga() {
  log('coreSaga', 'starting');
  yield runWatchers(watchers);

  yield apply(socket, socket.connect);
  yield fork(services.initializeCore);

  log('coreSaga', 'waiting for LOGOUT action');
  yield take(ActionTypes.LOGOUT);
  log('coreSaga', 'LOGOUT action received, redirecting to login');

  const oidcBootstrap = yield select(selectors.selectOidcBootstrap);

  if (oidcBootstrap && oidcBootstrap.endSessionUrl !== null) {
    const currentUser = yield select(selectors.selectCurrentUser);

    if (!currentUser || currentUser.isSsoUser) {
      // Redirect the user to the IDP to log out.
      log('coreSaga', 'redirecting to OIDC endSessionUrl');
      window.location.href = oidcBootstrap.endSessionUrl;
      return;
    }
  }

  log('coreSaga', 'redirecting to login page');
  window.location.href = Paths.LOGIN;
}
