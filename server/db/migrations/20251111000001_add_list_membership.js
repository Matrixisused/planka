/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = (knex) =>
  knex.schema.createTable('list_membership', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('list_id').notNullable();
    table.bigInteger('user_id').notNullable();
    table.text('role').notNullable().defaultTo('editor');
    table.boolean('can_comment');

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.unique(['list_id', 'user_id']);
  });

exports.down = (knex) => knex.schema.dropTable('list_membership');
