/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* publicTokensEntryWatchers() {
  yield all([
    takeEvery(EntryActionTypes.PUBLIC_TOKEN_FOR_CURRENT_BOARD_CREATE, () =>
      services.createPublicTokenForCurrentBoard(),
    ),
    takeEvery(EntryActionTypes.PUBLIC_TOKEN_FOR_CURRENT_BOARD_DELETE, () =>
      services.deletePublicTokenForCurrentBoard(),
    ),
    takeEvery(EntryActionTypes.PUBLIC_TOKEN_FOR_CURRENT_LIST_CREATE, ({ payload: { listId } }) =>
      services.createPublicTokenForCurrentList(listId),
    ),
    takeEvery(EntryActionTypes.PUBLIC_TOKEN_FOR_CURRENT_LIST_DELETE, ({ payload: { listId } }) =>
      services.deletePublicTokenForCurrentList(listId),
    ),
    takeEvery(EntryActionTypes.PUBLIC_TOKEN_FOR_CURRENT_CARD_CREATE, ({ payload: { cardId } }) =>
      services.createPublicTokenForCurrentCard(cardId),
    ),
    takeEvery(EntryActionTypes.PUBLIC_TOKEN_FOR_CURRENT_CARD_DELETE, ({ payload: { cardId } }) =>
      services.deletePublicTokenForCurrentCard(cardId),
    ),
  ]);
}
