/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import http from './http';
import socket from './socket';

/* Actions */

const getPublicTokenForBoard = (boardId, headers) =>
  socket.get(`/boards/${boardId}/public-token`, undefined, headers);

const createPublicTokenForBoard = (boardId, headers) =>
  socket.post(`/boards/${boardId}/public-token`, {}, headers);

const deletePublicTokenForBoard = (boardId, headers) =>
  socket.delete(`/boards/${boardId}/public-token`, undefined, headers);

const getPublicTokenForList = (listId, headers) =>
  socket.get(`/lists/${listId}/public-token`, undefined, headers);

const createPublicTokenForList = (listId, headers) =>
  socket.post(`/lists/${listId}/public-token`, {}, headers);

const deletePublicTokenForList = (listId, headers) =>
  socket.delete(`/lists/${listId}/public-token`, undefined, headers);

const getPublicTokenForCard = (cardId, headers) =>
  socket.get(`/cards/${cardId}/public-token`, undefined, headers);

const createPublicTokenForCard = (cardId, headers) =>
  socket.post(`/cards/${cardId}/public-token`, {}, headers);

const deletePublicTokenForCard = (cardId, headers) =>
  socket.delete(`/cards/${cardId}/public-token`, undefined, headers);

const getPublicBoard = (token) => http.get(`/public/${token}`);

const updatePublicTask = (token, taskId, data) =>
  http.patch(`/public/${token}/tasks/${taskId}`, data);

export default {
  getPublicTokenForBoard,
  createPublicTokenForBoard,
  deletePublicTokenForBoard,
  getPublicTokenForList,
  createPublicTokenForList,
  deletePublicTokenForList,
  getPublicTokenForCard,
  createPublicTokenForCard,
  deletePublicTokenForCard,
  getPublicBoard,
  updatePublicTask,
};
