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

    const { listMembership, list, board, project } = pathToProject;

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

    const user = await User.qm.getOneById(listMembership.userId);

    const deletedListMembership = await sails.helpers.listMemberships.deleteOne.with({
      user,
      project,
      board,
      list,
      record: listMembership,
      actorUser: currentUser,
      request: this.req,
    });

    if (!deletedListMembership) {
      throw Errors.LIST_MEMBERSHIP_NOT_FOUND;
    }

    return {
      item: deletedListMembership,
    };
  },
};
