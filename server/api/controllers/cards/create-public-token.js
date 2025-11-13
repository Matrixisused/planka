/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { v4: uuid } = require('uuid');
const { idInput } = require('../../../utils/inputs');

const Errors = {
  CARD_NOT_FOUND: {
    cardNotFound: 'Card not found',
  },
  TOKEN_ALREADY_EXISTS: {
    tokenAlreadyExists: 'Public token already exists for this card',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
    expiresAt: {
      type: 'ref',
    },
  },

  exits: {
    cardNotFound: {
      responseType: 'notFound',
    },
    tokenAlreadyExists: {
      responseType: 'conflict',
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    const card = await Card.qm.getOneById(inputs.id);

    if (!card) {
      throw Errors.CARD_NOT_FOUND;
    }

    const pathToProject = await sails.helpers.boards
      .getPathToProjectById(card.boardId)
      .intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

    const { project } = pathToProject;

    const isProjectManager = await sails.helpers.users.isProjectManager(
      currentUser.id,
      project.id,
    );

    if (!isProjectManager) {
      throw Errors.CARD_NOT_FOUND; // Forbidden
    }

    // Check if token already exists
    const existingToken = await PublicAccessToken.qm.getOneByCardId(card.id);

    if (existingToken) {
      throw Errors.TOKEN_ALREADY_EXISTS;
    }

    const token = uuid();

    const publicAccessToken = await PublicAccessToken.qm.createOne({
      token,
      cardId: card.id,
      expiresAt: inputs.expiresAt || null,
    });

    return exits.success({
      item: publicAccessToken,
    });
  },
};
