/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put } from 'redux-saga/effects';

import request from '../request';
import actions from '../../../actions';
import api from '../../../api';

export function* createPublicToken(boardId, listId, cardId) {
  let publicToken;
  try {
    const apiMethod = boardId
      ? api.createPublicTokenForBoard
      : listId
        ? api.createPublicTokenForList
        : api.createPublicTokenForCard;
    const id = boardId || listId || cardId;

    ({ item: publicToken } = yield call(request, apiMethod, id));
  } catch (error) {
    if (error.code === 'E_CONFLICT') {
      // Token already exists - fetch it
      try {
        const getMethod = boardId
          ? api.getPublicTokenForBoard
          : listId
            ? api.getPublicTokenForList
            : api.getPublicTokenForCard;
        const id = boardId || listId || cardId;
        ({ item: publicToken } = yield call(request, getMethod, id));
        yield put(actions.createPublicToken.success(publicToken));
        return;
      } catch (fetchError) {
        yield put(actions.createPublicToken.failure(fetchError));
        return;
      }
    }
    yield put(actions.createPublicToken.failure(error));
    return;
  }

  yield put(actions.createPublicToken.success(publicToken));
}

export function* deletePublicToken(boardId, listId, cardId) {
  let publicToken;
  try {
    const apiMethod = boardId
      ? api.deletePublicTokenForBoard
      : listId
        ? api.deletePublicTokenForList
        : api.deletePublicTokenForCard;
    const id = boardId || listId || cardId;

    ({ item: publicToken } = yield call(request, apiMethod, id));
  } catch (error) {
    yield put(actions.deletePublicToken.failure(error));
    return;
  }

  yield put(actions.deletePublicToken.success(publicToken));
}

export function* fetchPublicBoard(token) {
  let board;
  let included;
  try {
    ({ item: board, included } = yield call(request, api.getPublicBoard, token));
  } catch (error) {
    yield put(actions.fetchPublicBoard.failure(error));
    return;
  }

  yield put(actions.fetchPublicBoard.success(board, included));
}

export default {
  createPublicToken,
  deletePublicToken,
  fetchPublicBoard,
};
