/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import router from './router';
import socket from './socket';
import login from './login';
import core from './core';
import modals from './modals';
import config from './config';
import webhooks from './webhooks';
import users from './users';
import projects from './projects';
import projectManagers from './project-managers';
import backgroundImages from './background-images';
import baseCustomFieldGroups from './base-custom-field-groups';
import boards from './boards';
import boardMemberships from './board-memberships';
import labels from './labels';
import lists from './lists';
import listMemberships from './list-memberships';
import cards from './cards';
import cardMemberships from './card-memberships';
import taskLists from './task-lists';
import tasks from './tasks';
import attachments from './attachments';
import customFieldGroups from './custom-field-groups';
import customFields from './custom-fields';
import customFieldValues from './custom-field-values';
import comments from './comments';
import activities from './activities';
import notifications from './notifications';
import notificationServices from './notification-services';
import publicTokens from './public-tokens';

export default {
  ...router,
  ...socket,
  ...login,
  ...core,
  ...modals,
  ...config,
  ...webhooks,
  ...users,
  ...projects,
  ...projectManagers,
  ...backgroundImages,
  ...baseCustomFieldGroups,
  ...boards,
  ...boardMemberships,
  ...labels,
  ...lists,
  ...listMemberships,
  ...cards,
  ...cardMemberships,
  ...taskLists,
  ...tasks,
  ...attachments,
  ...customFieldGroups,
  ...customFields,
  ...customFieldValues,
  ...comments,
  ...activities,
  ...notifications,
  ...notificationServices,
  ...publicTokens,
};
