/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const normalizeValues = require('../../../utils/normalize-values');

module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    values: {
      type: 'json',
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
    list: {
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

  async fn(inputs) {
    const { values } = inputs;

    const normalizedValues = normalizeValues(
      {
        ...ListMembership.SHARED_RULES,
        ...ListMembership.RULES_BY_ROLE[values.role || inputs.record.role],
      },
      values,
      inputs.record,
    );

    const listMembership = await ListMembership.qm.updateOne(inputs.record.id, normalizedValues);

    if (listMembership) {
      sails.sockets.broadcast(
        `board:${inputs.board.id}`,
        'listMembershipUpdate',
        {
          item: listMembership,
        },
        inputs.request,
      );

      const webhooks = await Webhook.qm.getAll();

      sails.helpers.utils.sendWebhooks.with({
        webhooks,
        event: Webhook.Events.LIST_MEMBERSHIP_UPDATE,
        buildData: () => ({
          item: listMembership,
          included: {
            projects: [inputs.project],
            boards: [inputs.board],
            lists: [inputs.list],
          },
        }),
        buildPrevData: () => ({
          item: inputs.record,
        }),
        user: inputs.actorUser,
      });
    }

    return listMembership;
  },
};
