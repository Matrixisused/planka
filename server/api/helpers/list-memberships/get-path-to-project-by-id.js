/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    id: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    pathNotFound: {},
  },

  async fn(inputs) {
    const listMembership = await ListMembership.qm.getOneById(inputs.id);

    if (!listMembership) {
      throw 'pathNotFound';
    }

    const pathToProject = await sails.helpers.lists
      .getPathToProjectById(listMembership.listId)
      .intercept('pathNotFound', (nodes) => ({
        pathNotFound: {
          listMembership,
          ...nodes,
        },
      }));

    return {
      listMembership,
      ...pathToProject,
    };
  },
};
