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

    if (!publicAccessToken || !publicAccessToken.cardId) {
      throw Errors.TOKEN_NOT_FOUND;
    }

    if (!publicAccessToken.isActive) {
      throw Errors.TOKEN_INACTIVE;
    }

    if (publicAccessToken.expiresAt && new Date(publicAccessToken.expiresAt) < new Date()) {
      throw Errors.TOKEN_EXPIRED;
    }

    const card = await Card.qm.getOneById(publicAccessToken.cardId);

    if (!card) {
      throw Errors.TOKEN_NOT_FOUND;
    }

    const board = await Board.qm.getOneById(card.boardId);
    const project = await Project.qm.getOneById(board.projectId);
    const list = await List.qm.getOneById(card.listId);

    const taskLists = await TaskList.qm.getByCardId(card.id);
    const taskListIds = sails.helpers.utils.mapRecords(taskLists);

    const tasks = await Task.qm.getByTaskListIds(taskListIds);

    const labels = await Label.qm.getByBoardId(board.id);
    const cardLabels = await CardLabel.qm.getByCardId(card.id);

    const cardCustomFieldGroups = await CustomFieldGroup.qm.getByCardId(card.id);
    const customFieldGroupIds = sails.helpers.utils.mapRecords(cardCustomFieldGroups);

    const customFields = await CustomField.qm.getByCustomFieldGroupIds(customFieldGroupIds);
    const customFieldValues = await CustomFieldValue.qm.getByCardId(card.id);

    return {
      item: card,
      included: {
        board,
        list,
        labels,
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
