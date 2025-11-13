/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const defaultFind = (criteria) => ListMembership.find(criteria).sort('id');

/* Query methods */

const create = (arrayOfValues) => ListMembership.createEach(arrayOfValues).fetch();

const createOne = (values) => ListMembership.create({ ...values }).fetch();

const getByIds = (ids) => defaultFind(ids);

const getOneById = (id) => ListMembership.findOne({ id });

const getByListId = (listId) =>
  defaultFind({
    listId,
  });

const getByListIds = (listIds) =>
  defaultFind({
    listId: listIds,
  });

const getByUserId = (userId) =>
  defaultFind({
    userId,
  });

const getOneByListIdAndUserId = (listId, userId) =>
  ListMembership.findOne({
    listId,
    userId,
  });

const updateOne = async (id, values) => {
  const record = await ListMembership.updateOne({ id }, values);
  return record;
};

// eslint-disable-next-line no-underscore-dangle
const delete_ = (criteria) => ListMembership.destroy(criteria).fetch();

const deleteOne = (criteria) => ListMembership.destroyOne(criteria);

module.exports = {
  create,
  createOne,
  getByIds,
  getOneById,
  getByListId,
  getByListIds,
  getByUserId,
  getOneByListIdAndUserId,
  updateOne,
  deleteOne,
  delete: delete_,
};
