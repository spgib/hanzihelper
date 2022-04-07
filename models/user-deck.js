const pool = require('../db/pool');
const toCamelCase = require('../db/utils/to-camel-case');

class UserDeck {
  static async init() {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS user_decks (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      deck_id INTEGER NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    `);
  }

  static async insert(userId, deckId) {
    const { rows } = await pool.query(
      `INSERT INTO user_decks (user_id, deck_id) VALUES ($1, $2) RETURNING *`,
      [userId, deckId]
    );

    const parsedRows = toCamelCase(rows);

    return parsedRows[0];
  }

  static async getUserDecksInfo(userId) {
    const { rows } = await pool.query(
      `
      SELECT decks.id, title, description, user_decks.created_at
      FROM user_decks
      JOIN decks ON user_decks.deck_id = decks.id
      WHERE user_decks.user_id = $1;
    `,
      [userId]
    );

    const parsedRows = toCamelCase(rows);

    return parsedRows;
  }

  static async findByUserAndDeck(userId, deckId) {
    const { rows } = await pool.query(
      `SELECT * 
      FROM user_decks
      JOIN decks ON decks.id = user_decks.deck_id 
      WHERE user_id = $1 AND deck_id = $2;`,
      [userId, deckId]
    );

    const parsedRows = toCamelCase(rows);

    return parsedRows[0];
  }
}

module.exports = UserDeck;
