/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call } from 'redux-saga/effects';

import { fetchBoardByCurrentPath } from './boards';
import request from '../request';
import api from '../../../api';
import mergeRecords from '../../../utils/merge-records';
import { isUserAdminOrProjectOwner } from '../../../utils/record-helpers';
import { UserRoles } from '../../../constants/Enums';

export function* fetchCore() {
  const {
    item: user,
    included: { notificationServices: notificationServices1 },
  } = yield call(request, api.getCurrentUser, true);

  let config;
  let webhooks;

  if (user.role === UserRoles.ADMIN) {
    ({ item: config } = yield call(request, api.getConfig));
    ({ items: webhooks } = yield call(request, api.getWebhooks));
  }

  let users1;
  if (isUserAdminOrProjectOwner(user)) {
    ({ items: users1 } = yield call(request, api.getUsers));
  }

  const projectsResponse = yield call(request, api.getProjects);

  const {
    items: projects1,
    included: {
      projectManagers,
      backgroundImages,
      baseCustomFieldGroups,
      boards,
      users: users2,
      boardMemberships: boardMemberships1,
      lists: lists0,
      cards: cards0,
      cardMemberships: cardMemberships1,
      listMemberships: listMemberships1,
      customFields: customFields1,
      notificationServices: notificationServices2,
    },
  } = projectsResponse;

  let board;
  let card;
  let users3;
  let projects2;
  let boardMemberships2;
  let labels;
  let lists1;
  let cards1;
  let cardMemberships2;
  let listMemberships2;
  let cardLabels;
  let taskLists;
  let tasks;
  let attachments;
  let customFieldGroups;
  let customFields2;
  let customFieldValues;

  try {
    ({
      board,
      card,
      labels,
      lists: lists1,
      cardMemberships: cardMemberships2,
      listMemberships: listMemberships2,
      cardLabels,
      taskLists,
      tasks,
      attachments,
      customFieldGroups,
      customFieldValues,
      users: users3,
      projects: projects2,
      boardMemberships: boardMemberships2,
      cards: cards1,
      customFields: customFields2,
    } = yield call(fetchBoardByCurrentPath));
  } catch {
    /* empty */
  }

  const body = yield call(request, api.getNotifications);

  let { items: notifications } = body;

  const {
    included: { users: users4 },
  } = body;

  if (card) {
    const notificationIds = notifications.flatMap((notification) =>
      notification.cardId === card.id ? notification.id : [],
    );

    if (notificationIds.length > 0) {
      yield call(request, api.readCardNotifications, card.id);

      notifications = notifications.filter(
        (notification) => !notificationIds.includes(notification.id),
      );
    }
  }

  return {
    config,
    user,
    board,
    webhooks,
    projectManagers,
    backgroundImages,
    baseCustomFieldGroups,
    boards,
    labels,
    lists: mergeRecords(lists0, lists1),
    cardMemberships: mergeRecords(cardMemberships1, cardMemberships2),
    listMemberships: mergeRecords(listMemberships1, listMemberships2),
    cardLabels,
    taskLists,
    tasks,
    attachments,
    customFieldGroups,
    customFieldValues,
    notifications,
    users: mergeRecords(users1, users2, users3, users4),
    projects: mergeRecords(projects1, projects2),
    boardMemberships: mergeRecords(boardMemberships1, boardMemberships2),
    cards: mergeRecords(cards0, card && [card], cards1),
    customFields: mergeRecords(customFields1, customFields2),
    notificationServices: mergeRecords(notificationServices1, notificationServices2),
  };
}

export default {
  fetchCore,
};
