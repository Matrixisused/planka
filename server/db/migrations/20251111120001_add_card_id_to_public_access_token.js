/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = (knex) =>
  knex.schema.alterTable('public_access_token', (table) => {
    table.bigInteger('card_id');
  });

exports.down = (knex) =>
  knex.schema.alterTable('public_access_token', (table) => {
    table.dropColumn('card_id');
  });
