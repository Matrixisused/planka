/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const createPublicTokenForCurrentBoard = () => ({
  type: EntryActionTypes.PUBLIC_TOKEN_FOR_CURRENT_BOARD_CREATE,
  payload: {},
});

const deletePublicTokenForCurrentBoard = () => ({
  type: EntryActionTypes.PUBLIC_TOKEN_FOR_CURRENT_BOARD_DELETE,
  payload: {},
});

const createPublicTokenForCurrentList = (listId) => ({
  type: EntryActionTypes.PUBLIC_TOKEN_FOR_CURRENT_LIST_CREATE,
  payload: {
    listId,
  },
});

const deletePublicTokenForCurrentList = (listId) => ({
  type: EntryActionTypes.PUBLIC_TOKEN_FOR_CURRENT_LIST_DELETE,
  payload: {
    listId,
  },
});

const createPublicTokenForCurrentCard = (cardId) => ({
  type: EntryActionTypes.PUBLIC_TOKEN_FOR_CURRENT_CARD_CREATE,
  payload: {
    cardId,
  },
});

const deletePublicTokenForCurrentCard = (cardId) => ({
  type: EntryActionTypes.PUBLIC_TOKEN_FOR_CURRENT_CARD_DELETE,
  payload: {
    cardId,
  },
});

export default {
  createPublicTokenForCurrentBoard,
  deletePublicTokenForCurrentBoard,
  createPublicTokenForCurrentList,
  deletePublicTokenForCurrentList,
  createPublicTokenForCurrentCard,
  deletePublicTokenForCurrentCard,
};
