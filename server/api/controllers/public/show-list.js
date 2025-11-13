/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

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
};

module.exports = {
  inputs: {
    token: {
      type: 'string',
      required: true,
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
  },

  async fn(inputs) {
    const publicAccessToken = await PublicAccessToken.qm.getOneByToken(inputs.token);

    if (!publicAccessToken || !publicAccessToken.listId) {
      throw Errors.TOKEN_NOT_FOUND;
    }

    if (!publicAccessToken.isActive) {
      throw Errors.TOKEN_INACTIVE;
    }

    if (publicAccessToken.expiresAt && new Date(publicAccessToken.expiresAt) < new Date()) {
      throw Errors.TOKEN_EXPIRED;
    }

    const list = await List.qm.getOneById(publicAccessToken.listId);

    if (!list) {
      throw Errors.TOKEN_NOT_FOUND;
    }

    const board = await Board.qm.getOneById(list.boardId);
    const project = await Project.qm.getOneById(board.projectId);

    const cards = await Card.qm.getByListId(list.id);
    const cardIds = sails.helpers.utils.mapRecords(cards);

    const taskLists = await TaskList.qm.getByCardIds(cardIds);
    const taskListIds = sails.helpers.utils.mapRecords(taskLists);

    const tasks = await Task.qm.getByTaskListIds(taskListIds);

    const labels = await Label.qm.getByBoardId(board.id);
    const cardLabels = await CardLabel.qm.getByCardIds(cardIds);

    const cardCustomFieldGroups = await CustomFieldGroup.qm.getByCardIds(cardIds);
    const customFieldGroupIds = sails.helpers.utils.mapRecords(cardCustomFieldGroups);

    const customFields = await CustomField.qm.getByCustomFieldGroupIds(customFieldGroupIds);
    const customFieldValues = await CustomFieldValue.qm.getByCardIds(cardIds);

    return {
      item: list,
      included: {
        board,
        labels,
        cards,
        cardLabels,
        taskLists,
        tasks,
        customFieldGroups: cardCustomFieldGroups,
        customFields,
        customFieldValues,
        projects: [project],
      },
    };
  },
};
