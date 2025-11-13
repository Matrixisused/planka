/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const createCardMembershipInCurrentCard = (data) => ({
  type: EntryActionTypes.CARD_MEMBERSHIP_IN_CURRENT_CARD_CREATE,
  payload: {
    data,
  },
});

const deleteCardMembershipInCurrentCard = (userId) => ({
  type: EntryActionTypes.CARD_MEMBERSHIP_IN_CURRENT_CARD_DELETE,
  payload: {
    userId,
  },
});

const handleCardMembershipCreate = (cardMembership) => ({
  type: EntryActionTypes.CARD_MEMBERSHIP_CREATE_HANDLE,
  payload: {
    cardMembership,
  },
});

const handleCardMembershipUpdate = (cardMembership) => ({
  type: EntryActionTypes.CARD_MEMBERSHIP_UPDATE_HANDLE,
  payload: {
    cardMembership,
  },
});

const handleCardMembershipDelete = (cardMembership) => ({
  type: EntryActionTypes.CARD_MEMBERSHIP_DELETE_HANDLE,
  payload: {
    cardMembership,
  },
});

export default {
  createCardMembershipInCurrentCard,
  deleteCardMembershipInCurrentCard,
  handleCardMembershipCreate,
  handleCardMembershipUpdate,
  handleCardMembershipDelete,
};
