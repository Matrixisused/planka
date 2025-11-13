/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr, fk } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';

export default class extends BaseModel {
  static modelName = 'CardMembership';

  static fields = {
    id: attr(),
    role: attr(),
    canComment: attr(),
    cardId: fk({
      to: 'Card',
      as: 'card',
      relatedName: 'cardMemberships',
    }),
    userId: fk({
      to: 'User',
      as: 'user',
      relatedName: 'cardMemberships',
    }),
  };

  static reducer({ type, payload }, CardMembership, session) {
    switch (type) {
      case ActionTypes.CORE_INITIALIZE:
        if (payload.cardMemberships) {
          payload.cardMemberships.forEach((cardMembership) => {
            CardMembership.upsert(cardMembership);
          });
        }

        break;
      case ActionTypes.CARD_FETCH__SUCCESS:
      case ActionTypes.CARDS_FETCH__SUCCESS:
        if (payload.cardMemberships) {
          payload.cardMemberships.forEach((cardMembership) => {
            CardMembership.upsert(cardMembership);
          });
        }

        break;
      case ActionTypes.CARD_MEMBERSHIP_UPDATE__SUCCESS:
      case ActionTypes.CARD_MEMBERSHIP_UPDATE_HANDLE:
        if (payload.cardMembership) {
          CardMembership.upsert(payload.cardMembership);
        }

        break;
      case ActionTypes.CARD_MEMBERSHIP_CREATE__SUCCESS:
      case ActionTypes.CARD_MEMBERSHIP_CREATE_HANDLE:
        if (payload.cardMembership) {
          CardMembership.upsert(payload.cardMembership);

          // Also add user to card.users for UI compatibility
          const { Card, User } = session;
          const cardModel = Card.withId(payload.cardMembership.cardId);
          const userModel = User.withId(payload.cardMembership.userId);

          if (cardModel && userModel) {
            try {
              cardModel.users.add(userModel);
            } catch (error) {
              // User already in card.users
            }
          }
        }

        break;
      case ActionTypes.CARD_MEMBERSHIP_UPDATE:
        if (payload.id) {
          const cardMembershipModel = CardMembership.withId(payload.id);
          if (cardMembershipModel) {
            cardMembershipModel.update(payload.data);
          }
        }

        break;
      case ActionTypes.CARD_MEMBERSHIP_DELETE:
      case ActionTypes.CARD_MEMBERSHIP_DELETE__SUCCESS:
      case ActionTypes.CARD_MEMBERSHIP_DELETE_HANDLE: {
        const cardMembershipModel = CardMembership.withId(
          payload.cardMembership?.id || payload.id,
        );

        if (cardMembershipModel) {
          // Also remove user from card.users for UI compatibility
          const { Card } = session;
          const cardModel = Card.withId(cardMembershipModel.cardId);

          if (cardModel) {
            try {
              cardModel.users.remove(cardMembershipModel.userId);
            } catch (error) {
              // User not in card.users
            }
          }

          cardMembershipModel.delete();
        }

        break;
      }
      default:
    }
  }
}
