/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* cardMembershipsWatchers() {
  yield all([
    takeEvery(
      EntryActionTypes.CARD_MEMBERSHIP_CREATE_HANDLE,
      ({ payload: { cardMembership } }) => services.handleCardMembershipCreate(cardMembership),
    ),
    takeEvery(
      EntryActionTypes.CARD_MEMBERSHIP_UPDATE_HANDLE,
      ({ payload: { cardMembership } }) => services.handleCardMembershipUpdate(cardMembership),
    ),
    takeEvery(
      EntryActionTypes.CARD_MEMBERSHIP_DELETE_HANDLE,
      ({ payload: { cardMembership } }) => services.handleCardMembershipDelete(cardMembership),
    ),
  ]);
}
