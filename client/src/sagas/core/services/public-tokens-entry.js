/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, select } from 'redux-saga/effects';

import { createPublicToken, deletePublicToken } from './public-tokens';
import selectors from '../../../selectors';

export function* createPublicTokenForCurrentBoard() {
  const { boardId } = yield select(selectors.selectPath);

  yield call(createPublicToken, boardId, null);
}

export function* deletePublicTokenForCurrentBoard() {
  const { boardId } = yield select(selectors.selectPath);

  yield call(deletePublicToken, boardId, null);
}

export function* createPublicTokenForCurrentList(listId) {
  yield call(createPublicToken, null, listId);
}

export function* deletePublicTokenForCurrentList(listId) {
  yield call(deletePublicToken, null, listId);
}

export function* createPublicTokenForCurrentCard(cardId) {
  yield call(createPublicToken, null, null, cardId);
}

export function* deletePublicTokenForCurrentCard(cardId) {
  yield call(deletePublicToken, null, null, cardId);
}

export default {
  createPublicTokenForCurrentBoard,
  deletePublicTokenForCurrentBoard,
  createPublicTokenForCurrentList,
  deletePublicTokenForCurrentList,
  createPublicTokenForCurrentCard,
  deletePublicTokenForCurrentCard,
};
