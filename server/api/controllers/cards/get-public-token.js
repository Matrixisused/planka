/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  CARD_NOT_FOUND: {
    cardNotFound: 'Card not found',
  },
  TOKEN_NOT_FOUND: {
    tokenNotFound: 'Public token not found',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
  },

  exits: {
    cardNotFound: {
      responseType: 'notFound',
    },
    tokenNotFound: {
      responseType: 'notFound',
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

    const publicAccessToken = await PublicAccessToken.qm.getOneByCardId(card.id);

    if (!publicAccessToken) {
      throw Errors.TOKEN_NOT_FOUND;
    }

    return exits.success({
      item: publicAccessToken,
    });
  },
};
