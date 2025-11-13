/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = (knex) =>
  knex.schema.createTable('public_access_token', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.text('token').notNullable();
    table.bigInteger('board_id');
    table.bigInteger('list_id');
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamp('expires_at', true);

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.unique('token');
  });

exports.down = (knex) => knex.schema.dropTable('public_access_token');
