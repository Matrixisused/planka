/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  TOKEN_NOT_FOUND: {
    tokenNotFound: 'Public token not found',
  },
  TOKEN_EXPIRED: {
    tokenExpired: 'Public token has expired',
  },
  TOKEN_INACTIVE: {
    tokenInactive: 'Public token is inactive',
  },
  TASK_NOT_FOUND: {
    taskNotFound: 'Task not found',
  },
};

module.exports = {
  inputs: {
    token: {
      type: 'string',
      required: true,
    },
    taskId: {
      ...idInput,
      required: true,
    },
    isCompleted: {
      type: 'boolean',
    },
  },

  exits: {
    tokenNotFound: {
      responseType: 'notFound',
    },
    tokenExpired: {
      responseType: 'forbidden',
    },
    tokenInactive: {
      responseType: 'forbidden',
    },
    taskNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const publicAccessToken = await PublicAccessToken.qm.getOneByToken(inputs.token);

    if (!publicAccessToken) {
      throw Errors.TOKEN_NOT_FOUND;
    }

    if (!publicAccessToken.isActive) {
      throw Errors.TOKEN_INACTIVE;
    }

    if (publicAccessToken.expiresAt && new Date(publicAccessToken.expiresAt) < new Date()) {
      throw Errors.TOKEN_EXPIRED;
    }

    const pathToProject = await sails.helpers.tasks
      .getPathToProjectById(inputs.taskId)
      .intercept('pathNotFound', () => Errors.TASK_NOT_FOUND);

    const { task, board } = pathToProject;

    // Verify that the task belongs to a board accessible via this token
    let boardId;
    if (publicAccessToken.boardId) {
      boardId = publicAccessToken.boardId;
    } else if (publicAccessToken.listId) {
      const list = await List.qm.getOneById(publicAccessToken.listId);
      if (list) {
        boardId = list.boardId;
      }
    } else if (publicAccessToken.cardId) {
      const card = await Card.qm.getOneById(publicAccessToken.cardId);
      if (card) {
        boardId = card.boardId;
      }
    }

    if (!boardId || boardId !== board.id) {
      throw Errors.TASK_NOT_FOUND;
    }

    // Only allow updating isCompleted for public access
    const values = _.pick(inputs, ['isCompleted']);

    const { project, taskList, card, list } = pathToProject;

    // For public access, we need to handle actorUser differently
    // Create a minimal user object for webhook/action purposes
    const publicUser = {
      id: null,
      name: 'Public User',
      username: 'public',
    };

    const updatedTask = await sails.helpers.tasks.updateOne.with({
      project,
      board,
      list,
      card,
      taskList,
      record: task,
      values,
      actorUser: publicUser,
      request: this.req,
    });

    if (!updatedTask) {
      throw Errors.TASK_NOT_FOUND;
    }

    return {
      item: updatedTask,
    };
  },
};
