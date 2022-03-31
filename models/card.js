const { parse } = require('dotenv');
const pool = require('../db/pool');
const toCamelCase = require('../db/utils/to-camel-case');

class Card {
  static async init() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cards (
        id SERIAL PRIMARY KEY,
        hanzi VARCHAR(50) NOT NULL,
        pinyin VARCHAR(100) NOT NULL,
        meaning VARCHAR(100) NOT NULL,
        deck_id INTEGER NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
        creator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  static async findAllCardsFromDeckId(deckId) {
    const { rows } = await pool.query(
      `SELECT * FROM cards WHERE deck_id = $1;`,
      [deckId]
    );

    const parsedRows = toCamelCase(rows);

    return parsedRows;
  }

  static async getNextCards(deckId, limit, offset) {
    const { rows } = await pool.query(
      `
      SELECT id, hanzi, pinyin, meaning
      FROM cards
      WHERE deck_id = $1
      LIMIT $2
      OFFSET $3;
    `,
      [deckId, limit, offset]
    );

    return rows;
  }

  static async insert(hanzi, pinyin, meaning, deckId, userId) {
    const { rows } = await pool.query(
      `INSERT INTO cards (hanzi, pinyin, meaning, deck_id, creator_id) VALUES ($1, $2, $3, $4, $5) RETURNING id;`,
      [hanzi, pinyin, meaning, deckId, userId]
    );

    const parsedRows = toCamelCase(rows);

    return parsedRows[0];
  }
}

module.exports = Card;
