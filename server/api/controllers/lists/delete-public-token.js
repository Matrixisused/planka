/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  LIST_NOT_FOUND: {
    listNotFound: 'List not found',
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
    listNotFound: {
      responseType: 'notFound',
    },
    tokenNotFound: {
      responseType: 'notFound',
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

    const publicAccessToken = await PublicAccessToken.qm.getOneByListId(list.id);

    if (!publicAccessToken) {
      throw Errors.TOKEN_NOT_FOUND;
    }

    await PublicAccessToken.qm.deleteOne({
      id: publicAccessToken.id,
    });

    return exits.success({
      item: publicAccessToken,
    });
  },
};
