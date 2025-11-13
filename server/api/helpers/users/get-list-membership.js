/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    id: {
      type: 'string',
      required: true,
    },
    listId: {
      type: 'string',
      required: true,
    },
  },

  async fn(inputs) {
    const listMembership = await ListMembership.qm.getOneByListIdAndUserId(
      inputs.listId,
      inputs.id,
    );

    return listMembership;
  },
};
