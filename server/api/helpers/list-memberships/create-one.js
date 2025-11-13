/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const normalizeValues = require('../../../utils/normalize-values');

module.exports = {
  inputs: {
    values: {
      type: 'ref',
      required: true,
    },
    project: {
      type: 'ref',
      required: true,
    },
    board: {
      type: 'ref',
      required: true,
    },
    actorUser: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  exits: {
    userAlreadyListMember: {},
  },

  async fn(inputs) {
    const { values } = inputs;

    const role = values.role || ListMembership.Roles.EDITOR;

    const normalizedValues = normalizeValues(
      {
        ...ListMembership.SHARED_RULES,
        ...ListMembership.RULES_BY_ROLE[role],
      },
      values,
    );

    let listMembership;
    try {
      listMembership = await ListMembership.qm.createOne({
        ...normalizedValues,
        listId: values.list.id,
        userId: values.user.id,
        role,
      });
    } catch (error) {
      if (error.code === 'E_UNIQUE') {
        throw 'userAlreadyListMember';
      }

      throw error;
    }

    sails.sockets.broadcast(
      `board:${inputs.board.id}`,
      'listMembershipCreate',
      {
        item: listMembership,
      },
      inputs.request,
    );

    const webhooks = await Webhook.qm.getAll();

    sails.helpers.utils.sendWebhooks.with({
      webhooks,
      event: Webhook.Events.LIST_MEMBERSHIP_CREATE,
      buildData: () => ({
        item: listMembership,
        included: {
          users: [values.user],
          projects: [inputs.project],
          boards: [inputs.board],
          lists: [values.list],
        },
      }),
      user: inputs.actorUser,
    });

    return listMembership;
  },
};
