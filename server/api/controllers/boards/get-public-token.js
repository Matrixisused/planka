/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  BOARD_NOT_FOUND: {
    boardNotFound: 'Board not found',
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
    boardNotFound: {
      responseType: 'notFound',
    },
    tokenNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    const pathToProject = await sails.helpers.boards
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.BOARD_NOT_FOUND);

    const { board, project } = pathToProject;

    const isProjectManager = await sails.helpers.users.isProjectManager(
      currentUser.id,
      project.id,
    );

    if (!isProjectManager) {
      throw Errors.BOARD_NOT_FOUND; // Forbidden
    }

    const publicAccessToken = await PublicAccessToken.qm.getOneByBoardId(board.id);

    if (!publicAccessToken) {
      throw Errors.TOKEN_NOT_FOUND;
    }

    return exits.success({
      item: publicAccessToken,
    });
  },
};
