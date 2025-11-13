/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr, fk } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';

export default class PublicAccessToken extends BaseModel {
  static modelName = 'PublicAccessToken';

  static get fields() {
    return {
      id: attr(),
      token: attr(),
      isActive: attr({
        getDefault: () => true,
      }),
      expiresAt: attr(),
      boardId: fk({
        to: 'Board',
        as: 'board',
        relatedName: 'publicTokens',
      }),
      listId: fk({
        to: 'List',
        as: 'list',
        relatedName: 'publicTokens',
      }),
      cardId: fk({
        to: 'Card',
        as: 'card',
        relatedName: 'publicTokens',
      }),
    };
  }

  static reducer({ type, payload }, PublicAccessToken) {
    switch (type) {
      case ActionTypes.BOARD_FETCH__SUCCESS:
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        if (payload.publicAccessTokens) {
          payload.publicAccessTokens.forEach((publicAccessToken) => {
            PublicAccessToken.upsert(publicAccessToken);
          });
        }
        break;
      case ActionTypes.PUBLIC_TOKEN_CREATE__SUCCESS:
        PublicAccessToken.upsert(payload.publicToken);
        break;
      case ActionTypes.PUBLIC_TOKEN_DELETE__SUCCESS:
        if (payload.publicToken && payload.publicToken.id) {
          PublicAccessToken.withId(payload.publicToken.id).delete();
        }
        break;
      default:
        break;
    }
  }
}
