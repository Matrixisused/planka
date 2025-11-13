/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr, fk } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';

export default class extends BaseModel {
  static modelName = 'ListMembership';

  static fields = {
    id: attr(),
    role: attr(),
    canComment: attr(),
    listId: fk({
      to: 'List',
      as: 'list',
      relatedName: 'listMemberships',
    }),
    userId: fk({
      to: 'User',
      as: 'user',
      relatedName: 'listMemberships',
    }),
  };

  static reducer({ type, payload }, ListMembership) {
    switch (type) {
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.BOARD_FETCH__SUCCESS:
        if (payload.listMemberships) {
          payload.listMemberships.forEach((listMembership) => {
            ListMembership.upsert(listMembership);
          });
        }

        break;
      case ActionTypes.LIST_MEMBERSHIP_UPDATE__SUCCESS:
      case ActionTypes.LIST_MEMBERSHIP_UPDATE_HANDLE:
      case ActionTypes.LIST_MEMBERSHIP_CREATE__SUCCESS:
      case ActionTypes.LIST_MEMBERSHIP_CREATE_HANDLE:
        if (payload.listMembership) {
          ListMembership.upsert(payload.listMembership);
        }

        break;
      case ActionTypes.LIST_MEMBERSHIP_UPDATE:
        if (payload.id) {
          const listMembershipModel = ListMembership.withId(payload.id);
          if (listMembershipModel) {
            listMembershipModel.update(payload.data);
          }
        }

        break;
      case ActionTypes.LIST_MEMBERSHIP_DELETE:
      case ActionTypes.LIST_MEMBERSHIP_DELETE__SUCCESS:
      case ActionTypes.LIST_MEMBERSHIP_DELETE_HANDLE: {
        const listMembershipModel = ListMembership.withId(
          payload.listMembership?.id || payload.id,
        );

        if (listMembershipModel) {
          listMembershipModel.delete();
        }

        break;
      }
      default:
    }
  }
}
