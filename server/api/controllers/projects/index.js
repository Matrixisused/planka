/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Get all accessible projects
 *     description: Retrieves all projects the current user has access to, including managed projects, membership projects, and shared projects (for admins).
 *     tags:
 *       - Projects
 *     operationId: getProjects
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - items
 *                 - included
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Project'
 *                       - type: object
 *                         properties:
 *                           isFavorite:
 *                             type: boolean
 *                             description: Whether the project is marked as favorite by the current user
 *                             example: true
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
 */

module.exports = {
  async fn() {
    const { currentUser } = this.req;

    let sharedProjects;
    let sharedProjectIds;

    const managerProjectIds = await sails.helpers.users.getManagerProjectIds(currentUser.id);
    const fullyVisibleProjectIds = [...managerProjectIds];

    if (currentUser.role === User.Roles.ADMIN) {
      sharedProjects = await Project.qm.getShared({
        exceptIdOrIds: managerProjectIds,
      });

      sharedProjectIds = sails.helpers.utils.mapRecords(sharedProjects);
      fullyVisibleProjectIds.push(...sharedProjectIds);
    }

    // Get boards from BoardMembership
    const boardMemberships = await BoardMembership.qm.getByUserId(currentUser.id);
    let membershipBoardIds = sails.helpers.utils.mapRecords(boardMemberships, 'boardId');

    // Get boards from CardMembership
    const userCardMemberships = await CardMembership.qm.getByUserId(currentUser.id);
    if (userCardMemberships.length > 0) {
      const cardMembershipCardIds = sails.helpers.utils.mapRecords(userCardMemberships, 'cardId');
      sails.log.info('[PROJECTS] CardIDs from memberships:', cardMembershipCardIds);
      const cardsFromMembership = await Card.qm.getByIds(cardMembershipCardIds);
      sails.log.info('[PROJECTS] Cards found:', cardsFromMembership.length);
      const boardIdsFromCardMembership = sails.helpers.utils.mapRecords(cardsFromMembership, 'boardId', true);
      sails.log.info('[PROJECTS] BoardIDs from card memberships:', boardIdsFromCardMembership);
      membershipBoardIds = [...membershipBoardIds, ...boardIdsFromCardMembership];
    }

    // Get boards from ListMembership
    const userListMemberships = await ListMembership.qm.getByUserId(currentUser.id);
    if (userListMemberships.length > 0) {
      const listMembershipListIds = sails.helpers.utils.mapRecords(userListMemberships, 'listId');
      const listsFromMembership = await List.qm.getByIds(listMembershipListIds);
      const boardIdsFromListMembership = sails.helpers.utils.mapRecords(listsFromMembership, 'boardId', true);
      membershipBoardIds = [...membershipBoardIds, ...boardIdsFromListMembership];
    }

    // Remove duplicates
    membershipBoardIds = [...new Set(membershipBoardIds)];

    const membershipBoards = await Board.qm.getByIds(membershipBoardIds, {
      exceptProjectIdOrIds: fullyVisibleProjectIds,
    });

    const membershipProjectIds = sails.helpers.utils.mapRecords(
      membershipBoards,
      'projectId',
      true,
    );

    const projectIds = [...managerProjectIds, ...membershipProjectIds];
    sails.log.info('[PROJECTS] Final projectIds:', projectIds);
    const projects = await Project.qm.getByIds(projectIds);

    if (sharedProjectIds) {
      projectIds.push(...sharedProjectIds);
      projects.push(...sharedProjects);
    }

    const fullyVisibleBoards = await Board.qm.getByProjectIds(fullyVisibleProjectIds);
    const boards = [...fullyVisibleBoards, ...membershipBoards];

    // Get all board IDs
    const boardIds = sails.helpers.utils.mapRecords(boards);
    sails.log.info('[PROJECTS] boardIds:', boardIds);

    // Use userCardMemberships from above (all user's card memberships from accessible projects)
    const userCardMembershipCardIds = sails.helpers.utils.mapRecords(userCardMemberships, 'cardId');
    sails.log.info('[PROJECTS] Preparing response: userCardMemberships count:', userCardMemberships.length);
    sails.log.info('[PROJECTS] CardIDs to fetch:', userCardMembershipCardIds);

    // Get cards for these memberships
    const cardsFromMemberships = userCardMembershipCardIds.length > 0
      ? await Card.qm.getByIds(userCardMembershipCardIds)
      : [];
    const cardIdsInBoards = sails.helpers.utils.mapRecords(cardsFromMemberships);
    sails.log.info('[PROJECTS] Cards fetched:', cardsFromMemberships.length);

    // Return only user's own CardMemberships (already filtered)
    sails.log.info('[PROJECTS] Will return CardMemberships:', userCardMemberships.length);

    // Get all lists from these boards (no getByBoardIds method, use filter)
    const listsInBoards = boardIds.length > 0
      ? await List.find({ boardId: boardIds }).sort(['position', 'id'])
      : [];
    const listIdsInBoards = sails.helpers.utils.mapRecords(listsInBoards);

    // Use userListMemberships from above (already filtered by user)
    sails.log.info('[PROJECTS] User ListMemberships to return:', userListMemberships.length);

    const projectFavorites = await ProjectFavorite.qm.getByProjectIdsAndUserId(
      projectIds,
      currentUser.id,
    );

    const projectManagers = await ProjectManager.qm.getByProjectIds(projectIds);

    const userIds = sails.helpers.utils.mapRecords(projectManagers, 'userId', true);
    const users = await User.qm.getByIds(userIds);

    const backgroundImages = await BackgroundImage.qm.getByProjectIds(projectIds);

    const baseCustomFieldGroups = await BaseCustomFieldGroup.qm.getByProjectIds(projectIds);
    const baseCustomFieldGroupsIds = sails.helpers.utils.mapRecords(baseCustomFieldGroups);

    const customFields =
      await CustomField.qm.getByBaseCustomFieldGroupIds(baseCustomFieldGroupsIds);

    let notificationServices = [];
    if (managerProjectIds.length > 0) {
      const managerProjectIdsSet = new Set(managerProjectIds);

      const managerBoardIds = boards.flatMap((board) =>
        managerProjectIdsSet.has(board.projectId) ? board.id : [],
      );

      notificationServices = await NotificationService.qm.getByBoardIds(managerBoardIds);
    }

    const isFavoriteByProjectId = projectFavorites.reduce(
      (result, projectFavorite) => ({
        ...result,
        [projectFavorite.projectId]: true,
      }),
      {},
    );

    projects.forEach((project) => {
      // eslint-disable-next-line no-param-reassign
      project.isFavorite = isFavoriteByProjectId[project.id] || false;
    });

    // Get all CardMemberships for these cards (not just user's)
    const allCardMemberships = cardIdsInBoards.length > 0
      ? await CardMembership.qm.getByCardIds(cardIdsInBoards)
      : [];

    // Get all user IDs from CardMemberships to include them
    const cardMembershipUserIds = _.union(
      userIds,
      sails.helpers.utils.mapRecords(allCardMemberships, 'userId', true)
    );
    const allUsers = await User.qm.getByIds(cardMembershipUserIds);

    const responseData = {
      projects: projects.length,
      boards: boards.length,
      boardMemberships: boardMemberships.length,
      cardMemberships: userCardMemberships.length,
      listMemberships: userListMemberships.length,
      lists: listsInBoards.length,
      cards: cardsFromMemberships.length,
      users: allUsers.length,
    };


    return {
      items: projects,
      included: {
        projectManagers,
        baseCustomFieldGroups,
        boards,
        boardMemberships,
        lists: listsInBoards,
        cards: cardsFromMemberships,
        cardMemberships: userCardMemberships,
        listMemberships: userListMemberships,
        customFields,
        notificationServices,
        users: sails.helpers.users.presentMany(allUsers, currentUser),
        backgroundImages: sails.helpers.backgroundImages.presentMany(backgroundImages),
      },
    };
  },
};
