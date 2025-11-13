/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { put } from 'redux-saga/effects';

import actions from '../../../actions';

export function* handleCardMembershipCreate(cardMembership) {
  yield put(actions.handleCardMembershipCreate(cardMembership));
}

export function* handleCardMembershipUpdate(cardMembership) {
  yield put(actions.handleCardMembershipUpdate(cardMembership));
}

export function* handleCardMembershipDelete(cardMembership) {
  yield put(actions.handleCardMembershipDelete(cardMembership));
}

export default {
  handleCardMembershipCreate,
  handleCardMembershipUpdate,
  handleCardMembershipDelete,
};
