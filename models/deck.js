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
    const { rows } = await pool.query(
      `SELECT * FROM decks WHERE title = $1;`,
      [title]
    );

    const parsedRows = toCamelCase(rows);
    
    return parsedRows[0];
  }

  static async findById(id) {
    const { rows } = await pool.query(`SELECT * FROM decks WHERE id = $1`, [
      id,
    ]);

    const parsedRows = toCamelCase(rows);

    return parsedRows[0];
  }

  static async insert(title, creatorId) {
    const client = await pool.transactionClient();
    let parsedRows;

    try {
      await client.query('BEGIN;');
      const { rows: decks } = await client.query(
        `INSERT INTO decks (title, creator_id) VALUES ($1, $2) RETURNING *;`,
        [title, creatorId]
      );

      const { rows } = await client.query(
        `INSERT INTO user_decks (user_id, deck_id) VALUES ($1, $2) RETURNING *;`,
        [creatorId, decks[0].id]
      );

      parsedRows = toCamelCase(decks);
      await client.query('COMMIT;');
    } catch (err) {
      await client.query('ROLLBACK;');
      throw err;
    } finally {
      client.release();
    }

    return parsedRows[0];
  }

  static async delete(id) {
    const {rows} = await pool.query(`DELETE FROM decks WHERE id = $1 RETURNING *;`, [id]);

    const parsedRows = toCamelCase(rows);

    return parsedRows[0];
  }
}

module.exports = Deck;
