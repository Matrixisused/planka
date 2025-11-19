/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { HISTORY_METHOD_CALL } from './actions';

const createRouterMiddleware = (history) => {
  // eslint-disable-next-line consistent-return
  return () => (next) => (action) => {
    if (action.type !== HISTORY_METHOD_CALL) {
      return next(action);
    }

    const {
      payload: { method, args },
    } = action;

    if (method === 'push' && args[0] && typeof args[0] === 'object' && args[0].pathname) {
      const { pathname, state } = args[0];
      history[method](pathname, state);
      return;
    }

    history[method](...args);
  };
};

export default createRouterMiddleware;
