const pool = require('../db/pool');
const toCamelCase = require('../db/utils/to-camel-case');

class UserDeck {
  static init() {
    pool.query(`
    CREATE TABLE IF NOT EXISTS user_decks (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      deck_id INTEGER NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
    `);
  }

  static async insert(userId, deckId) {
    const {rows} = await pool.query(`INSERT INTO user_decks (user_id, deck_id) VALUES ($1, $2) RETURNING *`, [userId, deckId]);

    const parsedRows = toCamelCase(rows);

    return parsedRows[0];
  }

  static async findByUser(userId) {
    const {rows} = await pool.query(`
      SELECT title, description
      FROM decks
      JOIN user_decks ON decks.id = user_decks.deck_id
      JOIN users ON user_decks.user_id = users.id
      WHERE users.id = $1;
    `, [userId]);

    return rows;
  }
};

module.exports = UserDeck;