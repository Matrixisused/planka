/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Get project details
 *     description: Retrieves comprehensive project information, including boards, board memberships, and other related data.
 *     tags:
 *       - Projects
 *     operationId: getProject
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the project to retrieve
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     responses:
 *       200:
 *         description: Project details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *                 - included
 *               properties:
 *                 item:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Project'
 *                     - type: object
 *                       properties:
 *                         isFavorite:
 *                           type: boolean
 *                           description: Whether the project is marked as favorite by the current user
 *                           example: true
 *                 included:
 *                   type: object
 *                   required:
 *                     - users
 *                     - projectManagers
 *                     - backgroundImages
 *                     - baseCustomFieldGroups
 *                     - boards
 *                     - boardMemberships
 *                     - customFields
 *                     - notificationServices
 *                   properties:
 *                     users:
 *                       type: array
 *                       description: Related users
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     projectManagers:
 *                       type: array
 *                       description: Related project managers
 *                       items:
 *                         $ref: '#/components/schemas/ProjectManager'
 *                     backgroundImages:
 *                       type: array
 *                       description: Related background images
 *                       items:
 *                         $ref: '#/components/schemas/BackgroundImage'
 *                     baseCustomFieldGroups:
 *                       type: array
 *                       description: Related base custom field groups
 *                       items:
 *                         $ref: '#/components/schemas/BaseCustomFieldGroup'
 *                     boards:
 *                       type: array
 *                       description: Related boards
 *                       items:
 *                         $ref: '#/components/schemas/Board'
 *                     boardMemberships:
 *                       type: array
 *                       description: Related board memberships (for current user)
 *                       items:
 *                         $ref: '#/components/schemas/BoardMembership'
 *                     customFields:
 *                       type: array
 *                       description: Related custom fields
 *                       items:
 *                         $ref: '#/components/schemas/CustomField'
 *                     notificationServices:
 *                       type: array
 *                       description: Related notification services (for managed projects)
 *                       items:
 *                         $ref: '#/components/schemas/NotificationService'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
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
    projectNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const project = await Project.qm.getOneById(inputs.id);

    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

    const boardMemberships = await BoardMembership.qm.getByProjectIdAndUserId(
      project.id,
      currentUser.id,
    );

    let boards;
    if (currentUser.role !== User.Roles.ADMIN || project.ownerProjectManagerId) {
      if (!isProjectManager) {
        if (boardMemberships.length === 0) {
          // Check for list or card memberships
          const allBoards = await Board.qm.getByProjectId(project.id);
          const allBoardIds = sails.helpers.utils.mapRecords(allBoards);

          const allLists = await List.qm.getByBoardIds(allBoardIds);
          const allListIds = sails.helpers.utils.mapRecords(allLists);

          const listMemberships = await ListMembership.qm.getByListIds(allListIds);
          const userListMemberships = listMemberships.filter(lm => lm.userId === currentUser.id);

          const allCards = await Card.qm.getByBoardIds(allBoardIds);
          const allCardIds = sails.helpers.utils.mapRecords(allCards);

          const cardMemberships = await CardMembership.qm.getByCardIds(allCardIds);
          const userCardMemberships = cardMemberships.filter(cm => cm.userId === currentUser.id);

          if (userListMemberships.length === 0 && userCardMemberships.length === 0) {
            throw Errors.PROJECT_NOT_FOUND; // Forbidden
          }

          // Get boards from list/card memberships
          const listMembershipListIds = new Set(sails.helpers.utils.mapRecords(userListMemberships, 'listId'));
          const cardMembershipCardIds = new Set(sails.helpers.utils.mapRecords(userCardMemberships, 'cardId'));

          const boardsFromListMembership = allLists
            .filter(list => listMembershipListIds.has(list.id))
            .map(list => allBoards.find(board => board.id === list.boardId))
            .filter(board => board);

          const boardsFromCardMembership = allCards
            .filter(card => cardMembershipCardIds.has(card.id))
            .map(card => allBoards.find(board => board.id === card.boardId))
            .filter(board => board);

          boards = [...boardsFromListMembership, ...boardsFromCardMembership]
            .filter((board, index, self) => self.indexOf(board) === index);
        } else {
          const boardIds = sails.helpers.utils.mapRecords(boardMemberships, 'boardId');
          boards = await Board.qm.getByIds(boardIds);
        }
      }
    }

    if (!boards) {
      boards = await Board.qm.getByProjectId(project.id);
    }

    project.isFavorite = await sails.helpers.users.isProjectFavorite(currentUser.id, project.id);

    const projectManagers = await ProjectManager.qm.getByProjectId(project.id);

    const userIds = sails.helpers.utils.mapRecords(projectManagers, 'userId');
    const users = await User.qm.getByIds(userIds);

    const backgroundImages = await BackgroundImage.qm.getByProjectId(project.id);

    const baseCustomFieldGroups = await BaseCustomFieldGroup.qm.getByProjectId(project.id);
    const baseCustomFieldGroupsIds = sails.helpers.utils.mapRecords(baseCustomFieldGroups);

    const customFields =
      await CustomField.qm.getByBaseCustomFieldGroupIds(baseCustomFieldGroupsIds);

    let notificationServices = [];
    if (isProjectManager) {
      boardIds = sails.helpers.utils.mapRecords(boards);
      notificationServices = await NotificationService.qm.getByBoardIds(boardIds);
    }

    return {
      item: project,
      included: {
        projectManagers,
        baseCustomFieldGroups,
        boards,
        boardMemberships,
        customFields,
        notificationServices,
        users: sails.helpers.users.presentMany(users, currentUser),
        backgroundImages: sails.helpers.backgroundImages.presentMany(backgroundImages),
      },
    };
  },
};
