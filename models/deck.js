const pool = require('../db/pool');
const toCamelCase = require('../db/utils/to-camel-case');

class Deck {
  static async init() {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS decks (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      title VARCHAR(50) NOT NULL UNIQUE,
      description VARCHAR(200),
      creator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
      public BOOLEAN DEFAULT FALSE
      )
    `);
  }

  static async findByTitle(title) {
    const { rows } = await pool.query(`SELECT id FROM decks WHERE title = $1;`, [
      title,
    ]);
    
    return rows[0];
  }

  static async insert(title, creatorId) {
    const { rows } = await pool.query(
      `INSERT INTO decks (title, creator_id) VALUES ($1, $2) RETURNING *;`,
      [title, creatorId]
    );

    const parsedRows = toCamelCase(rows);

    return parsedRows[0];
  }
}

module.exports = Deck;
