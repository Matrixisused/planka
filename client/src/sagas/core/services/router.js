/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put, select, take } from 'redux-saga/effects';
import { push } from '../../../lib/redux-router';

import { logout } from './core';
import request from '../request';
import selectors from '../../../selectors';
import actions from '../../../actions';
import api from '../../../api';
import mergeRecords from '../../../utils/merge-records';
import ActionTypes from '../../../constants/ActionTypes';
import Paths from '../../../constants/Paths';
import { log } from '../../../utils/logger';

export function* goTo(pathname) {
  yield put(push(pathname));
}

export function* goToRoot() {
  yield call(goTo, Paths.ROOT);
}

export function* goToProject(projectId) {
  yield call(goTo, Paths.PROJECTS.replace(':id', projectId));
}

export function* goToBoard(boardId) {
  yield call(goTo, Paths.BOARDS.replace(':id', boardId));
}

export function* goToCard(cardId) {
  const locationState = yield select(selectors.selectLocationState);
  const returnTo = locationState?.returnTo;

  if (returnTo) {
    yield put(push(Paths.CARDS.replace(':id', cardId), { returnTo }));
  } else {
    yield put(push(Paths.CARDS.replace(':id', cardId)));
  }
}

export function* handleLocationChange() {
  const accessToken = yield select(selectors.selectAccessToken);
  log('router', 'handleLocationChange: accessToken exists?', !!accessToken);

  if (!accessToken) {
    log('router', 'handleLocationChange: no accessToken, logging out');
    yield call(logout, false);
    return;
  }

  const pathsMatch = yield select(selectors.selectPathsMatch);
  log('router', 'handleLocationChange: path', pathsMatch?.pattern?.path);

  if (!pathsMatch) {
    yield put(actions.handleLocationChange());
    return;
  }

  switch (pathsMatch.pattern.path) {
    case Paths.LOGIN:
    case Paths.OIDC_CALLBACK:
      yield call(goToRoot);

      break;
    default:
  }

  const isInitializing = yield select(selectors.selectIsInitializing);

  if (isInitializing) {
    yield take(ActionTypes.CORE_INITIALIZE);
  }

  let currentBoard = yield select(selectors.selectCurrentBoard);

  let currentBoardId = null;
  let currentCardId = null;
  let isEditModeEnabled;
  let board;
  let card = null;
  let users1;
  let users2;
  let projects;
  let boardMemberships;
  let labels;
  let lists;
  let cards;
  let cardMemberships1;
  let cardMemberships2;
  let cardLabels1;
  let cardLabels2;
  let taskLists1;
  let taskLists2;
  let tasks1;
  let tasks2;
  let attachments1;
  let attachments2;
  let customFieldGroups1;
  let customFieldGroups2;
  let customFields1;
  let customFields2;
  let customFieldValues1;
  let customFieldValues2;
  let notificationsToDelete;

  switch (pathsMatch.pattern.path) {
    case Paths.ROOT:
      isEditModeEnabled = false;

      break;
    case Paths.MENTIONED_CARDS:
    case Paths.MEMBER_CARDS:
      log('router', 'handleLocationChange: MENTIONED_CARDS/MEMBER_CARDS path');
      isEditModeEnabled = false;

      break;
    case Paths.PROJECTS: {
      const boardIds = yield select(selectors.selectBoardIdsForCurrentProject);

      if (boardIds && boardIds.length === 0) {
        isEditModeEnabled = true;
      }

      break;
    }
    case Paths.BOARDS:
      if (currentBoard) {
        ({ id: currentBoardId } = currentBoard);

        if (currentBoard.isFetching === null) {
          yield put(actions.handleLocationChange.fetchBoard(currentBoard.id));

          try {
            ({
              item: board,
              included: {
                projects,
                boardMemberships,
                labels,
                lists,
                cards,
                users: users1,
                cardMemberships: cardMemberships1,
                cardLabels: cardLabels1,
                taskLists: taskLists1,
                tasks: tasks1,
                attachments: attachments1,
                customFieldGroups: customFieldGroups1,
                customFields: customFields1,
                customFieldValues: customFieldValues1,
              },
            } = yield call(request, api.getBoard, currentBoard.id, true));
          } catch {
            /* empty */
          }
        }
      }

      break;
    case Paths.CARDS:
      ({ cardId: currentCardId, boardId: currentBoardId } = yield select(selectors.selectPath));
      log('router', 'handleLocationChange: CARDS path', {
        currentCardId,
        currentBoardId,
        cardIdFromPath: pathsMatch.params.id,
      });

      // Check if card exists in ORM, not just if cardId is set
      const cardInOrm = yield select(selectors.selectCardById, pathsMatch.params.id);
      log('router', 'handleLocationChange: cardInOrm check', {
        cardId: pathsMatch.params.id,
        cardInOrm: !!cardInOrm,
        cardInOrmId: cardInOrm?.id,
      });

      if (!cardInOrm) {
        log('router', 'handleLocationChange: card not in ORM, loading card', pathsMatch.params.id);
        yield put(actions.handleLocationChange.fetchContent());

        try {
          ({
            item: card,
            included: {
              users: users1,
              cardMemberships: cardMemberships1,
              cardLabels: cardLabels1,
              taskLists: taskLists1,
              tasks: tasks1,
              attachments: attachments1,
              customFieldGroups: customFieldGroups1,
              customFields: customFields1,
              customFieldValues: customFieldValues1,
            },
          } = yield call(request, api.getCard, pathsMatch.params.id));
        } catch {
          /* empty */
        }

        if (card) {
          log('router', 'handleLocationChange: card loaded', {
            cardId: card.id,
            boardId: card.boardId,
          });
          ({ id: currentCardId } = card);

          currentBoard = yield select(selectors.selectBoardById, card.boardId);

          if (currentBoard) {
            ({ id: currentBoardId } = currentBoard);

            if (currentBoard.isFetching === null) {
              try {
                ({
                  item: board,
                  included: {
                    projects,
                    boardMemberships,
                    labels,
                    lists,
                    cards,
                    users: users2,
                    cardMemberships: cardMemberships2,
                    cardLabels: cardLabels2,
                    taskLists: taskLists2,
                    tasks: tasks2,
                    attachments: attachments2,
                    customFieldGroups: customFieldGroups2,
                    customFields: customFields2,
                    customFieldValues: customFieldValues2,
                  },
                } = yield call(request, api.getBoard, card.boardId, true));
              } catch {
                /* empty */
              }
            }
          } else {
            // Board not found in state, load it
            currentBoardId = card.boardId;
            log('router', 'handleLocationChange: board not found in state, loading board', currentBoardId);

            try {
              ({
                item: board,
                included: {
                  projects,
                  boardMemberships,
                  labels,
                  lists,
                  cards,
                  users: users2,
                  cardMemberships: cardMemberships2,
                  cardLabels: cardLabels2,
                  taskLists: taskLists2,
                  tasks: tasks2,
                  attachments: attachments2,
                  customFieldGroups: customFieldGroups2,
                  customFields: customFields2,
                  customFieldValues: customFieldValues2,
                },
              } = yield call(request, api.getBoard, card.boardId, true));
            } catch {
              /* empty */
            }
          }
        }
      } else {
        // Card already in ORM, but we still need to load full card data (taskLists, tasks, attachments, etc.)
        log('router', 'handleLocationChange: card already in ORM, loading full card data', {
          cardId: cardInOrm.id,
          currentCardId,
        });
        if (!currentCardId) {
          currentCardId = cardInOrm.id;
        }

        // Load full card data to get taskLists, tasks, attachments, etc.
        yield put(actions.handleLocationChange.fetchContent());

        try {
          ({
            item: card,
            included: {
              users: users1,
              cardMemberships: cardMemberships1,
              cardLabels: cardLabels1,
              taskLists: taskLists1,
              tasks: tasks1,
              attachments: attachments1,
              customFieldGroups: customFieldGroups1,
              customFields: customFields1,
              customFieldValues: customFieldValues1,
            },
          } = yield call(request, api.getCard, pathsMatch.params.id));
          log('router', 'handleLocationChange: full card data loaded', {
            cardId: card?.id,
            hasTaskLists: !!taskLists1?.length,
            hasTasks: !!tasks1?.length,
            hasAttachments: !!attachments1?.length,
          });
        } catch {
          /* empty */
        }

        // Load board if not already loaded
        if (!currentBoardId) {
          currentBoardId = cardInOrm.boardId;
        }

        currentBoard = yield select(selectors.selectBoardById, cardInOrm.boardId);

        if (!currentBoard || currentBoard.isFetching === null) {
          log('router', 'handleLocationChange: loading board for card in ORM', cardInOrm.boardId);
          try {
            ({
              item: board,
              included: {
                projects,
                boardMemberships,
                labels,
                lists,
                cards,
                users: users2,
                cardMemberships: cardMemberships2,
                cardLabels: cardLabels2,
                taskLists: taskLists2,
                tasks: tasks2,
                attachments: attachments2,
                customFieldGroups: customFieldGroups2,
                customFields: customFields2,
                customFieldValues: customFieldValues2,
              },
            } = yield call(request, api.getBoard, cardInOrm.boardId, true));
          } catch {
            /* empty */
          }
        }
      }

      if (currentCardId) {
        const notificationIds = yield select(
          selectors.selectNotificationIdsByCardId,
          currentCardId,
        );

        if (notificationIds.length > 0) {
          try {
            ({
              included: { notifications: notificationsToDelete },
            } = yield call(request, api.readCardNotifications, currentCardId));
          } catch {
            /* empty */
          }
        }
      }

      break;
    default:
  }

  log('router', 'handleLocationChange: final state', {
    currentCardId,
    currentBoardId,
    hasCard: !!card,
    hasBoard: !!board,
  });

  yield put(
    actions.handleLocationChange(
      pathsMatch.pathname,
      currentBoardId,
      currentCardId,
      isEditModeEnabled,
      board,
      mergeRecords(users1, users2),
      projects,
      boardMemberships,
      labels,
      lists,
      mergeRecords(card && [card], cards),
      mergeRecords(cardMemberships1, cardMemberships2),
      mergeRecords(cardLabels1, cardLabels2),
      mergeRecords(taskLists1, taskLists2),
      mergeRecords(tasks1, tasks2),
      mergeRecords(attachments1, attachments2),
      mergeRecords(customFieldGroups1, customFieldGroups2),
      mergeRecords(customFields1, customFields2),
      mergeRecords(customFieldValues1, customFieldValues2),
      notificationsToDelete,
    ),
  );
}

export default {
  goTo,
  goToRoot,
  goToProject,
  goToBoard,
  goToCard,
  handleLocationChange,
};
