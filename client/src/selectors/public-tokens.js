/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { createSelector } from 'redux-orm';

import orm from '../orm';

export const selectPublicTokenForBoard = createSelector(
  orm,
  (_, boardId) => boardId,
  ({ PublicAccessToken }, boardId) => {
    const tokens = PublicAccessToken.all().toRefArray();
    return tokens.find((t) => t.boardId === boardId) || null;
  },
);

export const selectPublicTokenForList = createSelector(
  orm,
  (_, listId) => listId,
  ({ PublicAccessToken }, listId) => {
    const tokens = PublicAccessToken.all().toRefArray();
    return tokens.find((t) => t.listId === listId) || null;
  },
);

export const selectPublicTokenForCard = createSelector(
  orm,
  (_, cardId) => cardId,
  ({ PublicAccessToken }, cardId) => {
    const tokens = PublicAccessToken.all().toRefArray();
    return tokens.find((t) => t.cardId === cardId) || null;
  },
);

export default {
  selectPublicTokenForBoard,
  selectPublicTokenForList,
  selectPublicTokenForCard,
};
