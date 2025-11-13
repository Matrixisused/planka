/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  LIST_MEMBERSHIP_NOT_FOUND: {
    listMembershipNotFound: 'List membership not found',
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
      isIn: Object.values(ListMembership.Roles),
    },
    canComment: {
      type: 'boolean',
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    listMembershipNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const pathToProject = await sails.helpers.listMemberships
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.LIST_MEMBERSHIP_NOT_FOUND);

    let { listMembership } = pathToProject;
    const { list, board, project } = pathToProject;

    const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
      board.id,
      currentUser.id,
    );

    if (!boardMembership) {
      throw Errors.LIST_MEMBERSHIP_NOT_FOUND; // Forbidden
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const values = _.pick(inputs, ['role', 'canComment']);

    listMembership = await sails.helpers.listMemberships.updateOne.with({
      values,
      project,
      board,
      list,
      record: listMembership,
      actorUser: currentUser,
      request: this.req,
    });

    if (!listMembership) {
      throw Errors.LIST_MEMBERSHIP_NOT_FOUND;
    }

    return {
      item: listMembership,
    };
  },
};
