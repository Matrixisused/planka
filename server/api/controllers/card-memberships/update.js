/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  CARD_MEMBERSHIP_NOT_FOUND: {
    cardMembershipNotFound: 'Card membership not found',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
    role: {
      type: 'string',
      isIn: Object.values(CardMembership.Roles),
    },
    canComment: {
      type: 'boolean',
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    cardMembershipNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const pathToProject = await sails.helpers.cardMemberships
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.CARD_MEMBERSHIP_NOT_FOUND);

    let { cardMembership } = pathToProject;
    const { card, list, board, project } = pathToProject;

    const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
      board.id,
      currentUser.id,
    );

    if (!boardMembership) {
      throw Errors.CARD_MEMBERSHIP_NOT_FOUND; // Forbidden
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const values = _.pick(inputs, ['role', 'canComment']);

    cardMembership = await sails.helpers.cardMemberships.updateOne.with({
      values,
      project,
      board,
      list,
      card,
      record: cardMembership,
      actorUser: currentUser,
      request: this.req,
    });

    if (!cardMembership) {
      throw Errors.CARD_MEMBERSHIP_NOT_FOUND;
    }

    return {
      item: cardMembership,
    };
  },
};


