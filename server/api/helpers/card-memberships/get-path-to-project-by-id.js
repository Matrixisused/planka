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
    const cardMembership = await CardMembership.qm.getOneById(inputs.id);

    if (!cardMembership) {
      throw 'pathNotFound';
    }

    const pathToProject = await sails.helpers.cards
      .getPathToProjectById(cardMembership.cardId)
      .intercept('pathNotFound', (nodes) => ({
        pathNotFound: {
          cardMembership,
          ...nodes,
        },
      }));

    return {
      cardMembership,
      ...pathToProject,
    };
  },
};


