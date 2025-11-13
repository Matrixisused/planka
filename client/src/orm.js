/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { ORM } from 'redux-orm';

import {
  Activity,
  Attachment,
  BackgroundImage,
  BaseCustomFieldGroup,
  Board,
  BoardMembership,
  Card,
  CardMembership,
  Comment,
  List,
  ListMembership,
  CustomField,
  CustomFieldGroup,
  CustomFieldValue,
  Label,
  Notification,
  NotificationService,
  Project,
  ProjectManager,
  PublicAccessToken,
  Task,
  TaskList,
  User,
  Webhook,
} from './models';

const orm = new ORM({
  stateSelector: (state) => state.orm,
});

orm.register(
  Webhook,
  User,
  Project,
  ProjectManager,
  BackgroundImage,
  BaseCustomFieldGroup,
  Board,
  BoardMembership,
  Label,
  List,
  ListMembership,
  Card,
  CardMembership,
  TaskList,
  Task,
  Attachment,
  CustomFieldGroup,
  CustomField,
  CustomFieldValue,
  Comment,
  Activity,
  Notification,
  NotificationService,
  PublicAccessToken,
);

export default orm;
