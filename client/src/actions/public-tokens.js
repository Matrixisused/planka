/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const createPublicToken = (boardId, listId) => ({
  type: ActionTypes.PUBLIC_TOKEN_CREATE,
  payload: {
    boardId,
    listId,
  },
});

createPublicToken.success = (publicToken) => ({
  type: ActionTypes.PUBLIC_TOKEN_CREATE__SUCCESS,
  payload: {
    publicToken,
  },
});

createPublicToken.failure = (error) => ({
  type: ActionTypes.PUBLIC_TOKEN_CREATE__FAILURE,
  payload: {
    error,
  },
});

const deletePublicToken = (boardId, listId) => ({
  type: ActionTypes.PUBLIC_TOKEN_DELETE,
  payload: {
    boardId,
    listId,
  },
});

deletePublicToken.success = (publicToken) => ({
  type: ActionTypes.PUBLIC_TOKEN_DELETE__SUCCESS,
  payload: {
    publicToken,
  },
});

deletePublicToken.failure = (error) => ({
  type: ActionTypes.PUBLIC_TOKEN_DELETE__FAILURE,
  payload: {
    error,
  },
});

const fetchPublicBoard = (token) => ({
  type: ActionTypes.PUBLIC_BOARD_FETCH,
  payload: {
    token,
  },
});

fetchPublicBoard.success = (board, included) => ({
  type: ActionTypes.PUBLIC_BOARD_FETCH__SUCCESS,
  payload: {
    board,
    included,
  },
});

fetchPublicBoard.failure = (error) => ({
  type: ActionTypes.PUBLIC_BOARD_FETCH__FAILURE,
  payload: {
    error,
  },
});

export default {
  createPublicToken,
  deletePublicToken,
  fetchPublicBoard,
};
