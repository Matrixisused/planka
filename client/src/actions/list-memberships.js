/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const createListMembership = (listId, data) => ({
  type: ActionTypes.LIST_MEMBERSHIP_CREATE,
  payload: {
    listId,
    data,
  },
});

createListMembership.success = (listMembership) => ({
  type: ActionTypes.LIST_MEMBERSHIP_CREATE__SUCCESS,
  payload: {
    listMembership,
  },
});

createListMembership.failure = (listId, error) => ({
  type: ActionTypes.LIST_MEMBERSHIP_CREATE__FAILURE,
  payload: {
    listId,
    error,
  },
});

const updateListMembership = (id, data) => ({
  type: ActionTypes.LIST_MEMBERSHIP_UPDATE,
  payload: {
    id,
    data,
  },
});

updateListMembership.success = (listMembership) => ({
  type: ActionTypes.LIST_MEMBERSHIP_UPDATE__SUCCESS,
  payload: {
    listMembership,
  },
});

updateListMembership.failure = (id, error) => ({
  type: ActionTypes.LIST_MEMBERSHIP_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const deleteListMembership = (id) => ({
  type: ActionTypes.LIST_MEMBERSHIP_DELETE,
  payload: {
    id,
  },
});

deleteListMembership.success = (listMembership) => ({
  type: ActionTypes.LIST_MEMBERSHIP_DELETE__SUCCESS,
  payload: {
    listMembership,
  },
});

deleteListMembership.failure = (id, error) => ({
  type: ActionTypes.LIST_MEMBERSHIP_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleListMembershipCreate = (listMembership) => ({
  type: ActionTypes.LIST_MEMBERSHIP_CREATE_HANDLE,
  payload: {
    listMembership,
  },
});

const handleListMembershipUpdate = (listMembership) => ({
  type: ActionTypes.LIST_MEMBERSHIP_UPDATE_HANDLE,
  payload: {
    listMembership,
  },
});

const handleListMembershipDelete = (listMembership) => ({
  type: ActionTypes.LIST_MEMBERSHIP_DELETE_HANDLE,
  payload: {
    listMembership,
  },
});

export default {
  createListMembership,
  updateListMembership,
  deleteListMembership,
  handleListMembershipCreate,
  handleListMembershipUpdate,
  handleListMembershipDelete,
};
