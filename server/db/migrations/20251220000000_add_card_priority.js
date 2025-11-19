/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = async (knex) => {
  await knex.schema.alterTable('card', (table) => {
    /* Columns */

    table.integer('priority').defaultTo(null);
  });

  return knex.raw(`
    ALTER TABLE card ADD CONSTRAINT card_priority_check CHECK (priority >= 0 AND priority <= 100);
  `);
};

exports.down = (knex) =>
  knex.schema.table('card', (table) => {
    table.dropColumn('priority');
  });
