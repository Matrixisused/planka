/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  LIST_NOT_FOUND: {
    listNotFound: 'List not found',
  },
  USER_NOT_FOUND: {
    userNotFound: 'User not found',
  },
  USER_ALREADY_LIST_MEMBER: {
    userAlreadyListMember: 'User already list member',
  },
};

module.exports = {
  inputs: {
    listId: {
      ...idInput,
      required: true,
    },
    userId: {
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
    listNotFound: {
      responseType: 'notFound',
    },
    userNotFound: {
      responseType: 'notFound',
    },
    userAlreadyListMember: {
      responseType: 'conflict',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { list, board, project } = await sails.helpers.lists
      .getPathToProjectById(inputs.listId)
      .intercept('pathNotFound', () => Errors.LIST_NOT_FOUND);

    const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
      board.id,
      currentUser.id,
    );

    if (!boardMembership) {
      throw Errors.LIST_NOT_FOUND; // Forbidden
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const user = await User.qm.getOneById(inputs.userId);

    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    // Note: We intentionally allow adding users who are NOT board members
    // This is the core feature - direct access to lists bypassing board membership

    const listMembership = await sails.helpers.listMemberships.createOne
      .with({
        project,
        board,
        values: {
          list,
          user,
          role: inputs.role || ListMembership.Roles.EDITOR,
          canComment: inputs.canComment,
        },
        actorUser: currentUser,
        request: this.req,
      })
      .intercept('userAlreadyListMember', () => Errors.USER_ALREADY_LIST_MEMBER);

    return {
      item: listMembership,
    };
  },
};
