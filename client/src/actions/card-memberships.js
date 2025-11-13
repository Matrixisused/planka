/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const createCardMembership = (cardId, data) => ({
  type: ActionTypes.CARD_MEMBERSHIP_CREATE,
  payload: {
    cardId,
    data,
  },
});

createCardMembership.success = (cardMembership) => ({
  type: ActionTypes.CARD_MEMBERSHIP_CREATE__SUCCESS,
  payload: {
    cardMembership,
  },
});

createCardMembership.failure = (cardId, error) => ({
  type: ActionTypes.CARD_MEMBERSHIP_CREATE__FAILURE,
  payload: {
    cardId,
    error,
  },
});

const updateCardMembership = (id, data) => ({
  type: ActionTypes.CARD_MEMBERSHIP_UPDATE,
  payload: {
    id,
    data,
  },
});

updateCardMembership.success = (cardMembership) => ({
  type: ActionTypes.CARD_MEMBERSHIP_UPDATE__SUCCESS,
  payload: {
    cardMembership,
  },
});

updateCardMembership.failure = (id, error) => ({
  type: ActionTypes.CARD_MEMBERSHIP_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const deleteCardMembership = (id) => ({
  type: ActionTypes.CARD_MEMBERSHIP_DELETE,
  payload: {
    id,
  },
});

deleteCardMembership.success = (cardMembership) => ({
  type: ActionTypes.CARD_MEMBERSHIP_DELETE__SUCCESS,
  payload: {
    cardMembership,
  },
});

deleteCardMembership.failure = (id, error) => ({
  type: ActionTypes.CARD_MEMBERSHIP_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleCardMembershipCreate = (cardMembership) => ({
  type: ActionTypes.CARD_MEMBERSHIP_CREATE_HANDLE,
  payload: {
    cardMembership,
  },
});

const handleCardMembershipUpdate = (cardMembership) => ({
  type: ActionTypes.CARD_MEMBERSHIP_UPDATE_HANDLE,
  payload: {
    cardMembership,
  },
});

const handleCardMembershipDelete = (cardMembership) => ({
  type: ActionTypes.CARD_MEMBERSHIP_DELETE_HANDLE,
  payload: {
    cardMembership,
  },
});

export default {
  createCardMembership,
  updateCardMembership,
  deleteCardMembership,
  handleCardMembershipCreate,
  handleCardMembershipUpdate,
  handleCardMembershipDelete,
};
