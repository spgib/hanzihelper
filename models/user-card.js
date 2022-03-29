const pool = require('../db/pool');
const toCamelCase = require('../db/utils/to-camel-case');

class UserCard {
  static async init() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_cards (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        card_id INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
        first_learned TIMESTAMP WITH TIME ZONE,
        last_reviewed TIMESTAMP WITH TIME ZONE,
        next_review TIMESTAMP WITH TIME ZONE,
        probation BOOLEAN DEFAULT FALSE,
        learning_level INTEGER DEFAULT 0
      );
    `);
  }

  static async insert(userId, cardId) {
    const { rows } = await pool.query(
      `INSERT INTO user_cards (user_id, card_id) VALUES ($1, $2) RETURNING *;`,
      [userId, cardId]
    );

    const parsedRows = toCamelCase(rows);

    return parsedRows[0];
  }
}

module.exports = UserCard;
