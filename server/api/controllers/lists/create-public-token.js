/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { v4: uuid } = require('uuid');
const { idInput } = require('../../../utils/inputs');

const Errors = {
  LIST_NOT_FOUND: {
    listNotFound: 'List not found',
  },
  TOKEN_ALREADY_EXISTS: {
    tokenAlreadyExists: 'Public token already exists for this list',
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
    listNotFound: {
      responseType: 'notFound',
    },
    tokenAlreadyExists: {
      responseType: 'conflict',
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    const list = await List.qm.getOneById(inputs.id);

    if (!list) {
      throw Errors.LIST_NOT_FOUND;
    }

    const pathToProject = await sails.helpers.boards
      .getPathToProjectById(list.boardId)
      .intercept('pathNotFound', () => Errors.LIST_NOT_FOUND);

    const { project } = pathToProject;

    const isProjectManager = await sails.helpers.users.isProjectManager(
      currentUser.id,
      project.id,
    );

    if (!isProjectManager) {
      throw Errors.LIST_NOT_FOUND; // Forbidden
    }

    // Check if token already exists
    const existingToken = await PublicAccessToken.qm.getOneByListId(list.id);

    if (existingToken) {
      throw Errors.TOKEN_ALREADY_EXISTS;
    }

    const token = uuid();

    const publicAccessToken = await PublicAccessToken.qm.createOne({
      token,
      listId: list.id,
      expiresAt: inputs.expiresAt || null,
    });

    return exits.success({
      item: publicAccessToken,
    });
  },
};
