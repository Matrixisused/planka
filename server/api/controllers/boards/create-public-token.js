/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { v4: uuid } = require('uuid');
const { idInput } = require('../../../utils/inputs');

const Errors = {
  BOARD_NOT_FOUND: {
    boardNotFound: 'Board not found',
  },
  TOKEN_ALREADY_EXISTS: {
    tokenAlreadyExists: 'Public token already exists for this board',
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
    boardNotFound: {
      responseType: 'notFound',
    },
    tokenAlreadyExists: {
      responseType: 'conflict',
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

    // Check if token already exists
    const existingToken = await PublicAccessToken.qm.getOneByBoardId(board.id);

    if (existingToken) {
      throw Errors.TOKEN_ALREADY_EXISTS;
    }

    const token = uuid();

    const publicAccessToken = await PublicAccessToken.qm.createOne({
      token,
      boardId: board.id,
      expiresAt: inputs.expiresAt || null,
    });

    return exits.success({
      item: publicAccessToken,
    });
  },
};
