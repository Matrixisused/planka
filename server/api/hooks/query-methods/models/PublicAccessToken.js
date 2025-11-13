/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const defaultFind = (criteria) => PublicAccessToken.find(criteria).sort('id');

/* Query methods */

const createOne = (values) => PublicAccessToken.create({ ...values }).fetch();

const getOneById = (id) => PublicAccessToken.findOne(id);

const getOneByToken = (token) =>
  PublicAccessToken.findOne({
    token,
  });

const getOneByBoardId = (boardId) =>
  PublicAccessToken.findOne({
    boardId,
  });

const getOneByListId = (listId) =>
  PublicAccessToken.findOne({
    listId,
  });

const getOneByCardId = (cardId) =>
  PublicAccessToken.findOne({
    cardId,
  });

const updateOne = async (criteria, values) =>
  PublicAccessToken.updateOne(criteria).set({ ...values });

// eslint-disable-next-line no-underscore-dangle
const delete_ = (criteria) => PublicAccessToken.destroy(criteria).fetch();

const deleteOne = (criteria) => PublicAccessToken.destroyOne(criteria);

module.exports = {
  createOne,
  getOneById,
  getOneByToken,
  getOneByBoardId,
  getOneByListId,
  getOneByCardId,
  updateOne,
  deleteOne,
  delete: delete_,
};
