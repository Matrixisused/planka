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

    if (!publicAccessToken) {
      throw Errors.TOKEN_NOT_FOUND;
    }

    if (!publicAccessToken.isActive) {
      throw Errors.TOKEN_INACTIVE;
    }

    if (publicAccessToken.expiresAt && new Date(publicAccessToken.expiresAt) < new Date()) {
      throw Errors.TOKEN_EXPIRED;
    }

    // Determine the type of token and get the board
    let board;
    if (publicAccessToken.boardId) {
      board = await Board.qm.getOneById(publicAccessToken.boardId);
    } else if (publicAccessToken.listId) {
      const list = await List.qm.getOneById(publicAccessToken.listId);
      if (list) {
        board = await Board.qm.getOneById(list.boardId);
      }
    } else if (publicAccessToken.cardId) {
      const card = await Card.qm.getOneById(publicAccessToken.cardId);
      if (card) {
        board = await Board.qm.getOneById(card.boardId);
      }
    }

    if (!board) {
      throw Errors.TOKEN_NOT_FOUND;
    }

    const project = await Project.qm.getOneById(board.projectId);
    const labels = await Label.qm.getByBoardId(board.id);
    const lists = await List.qm.getByBoardId(board.id);

    const finiteLists = lists.filter((list) => sails.helpers.lists.isFinite(list));
    const finiteListIds = sails.helpers.utils.mapRecords(finiteLists);

    let cards = await Card.qm.getByListIds(finiteListIds);

    // Filter based on token type
    if (publicAccessToken.listId) {
      // Show only cards from specific list
      cards = cards.filter((card) => card.listId === publicAccessToken.listId);
    } else if (publicAccessToken.cardId) {
      // Show only specific card
      cards = cards.filter((card) => card.id === publicAccessToken.cardId);
    }

    const cardIds = sails.helpers.utils.mapRecords(cards);

    const taskLists = await TaskList.qm.getByCardIds(cardIds);
    const taskListIds = sails.helpers.utils.mapRecords(taskLists);

    const tasks = await Task.qm.getByTaskListIds(taskListIds);
    const cardLabels = await CardLabel.qm.getByCardIds(cardIds);

    const boardCustomFieldGroups = await CustomFieldGroup.qm.getByBoardId(board.id);
    const cardCustomFieldGroups = await CustomFieldGroup.qm.getByCardIds(cardIds);

    const customFieldGroups = [...boardCustomFieldGroups, ...cardCustomFieldGroups];
    const customFieldGroupIds = sails.helpers.utils.mapRecords(customFieldGroups);

    const customFields = await CustomField.qm.getByCustomFieldGroupIds(customFieldGroupIds);
    const customFieldValues = await CustomFieldValue.qm.getByCardIds(cardIds);

    return {
      item: board,
      included: {
        labels,
        lists,
        cards,
        cardLabels,
        taskLists,
        tasks,
        customFieldGroups,
        customFields,
        customFieldValues,
        projects: [project],
      },
    };
  },
};
