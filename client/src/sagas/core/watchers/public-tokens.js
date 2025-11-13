/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import ActionTypes from '../../../constants/ActionTypes';

export default function* publicTokensWatchers() {
  yield all([
    takeEvery(ActionTypes.PUBLIC_TOKEN_CREATE, ({ payload: { boardId, listId } }) =>
      services.createPublicToken(boardId, listId),
    ),
    takeEvery(ActionTypes.PUBLIC_TOKEN_DELETE, ({ payload: { boardId, listId } }) =>
      services.deletePublicToken(boardId, listId),
    ),
    takeEvery(ActionTypes.PUBLIC_BOARD_FETCH, ({ payload: { token } }) =>
      services.fetchPublicBoard(token),
    ),
  ]);
}
