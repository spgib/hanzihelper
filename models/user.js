const pool = require('../db/pool');
const toCamelCase = require('../db/utils/to-camel-case');

class User {
  static async init() {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      username VARCHAR(25) NOT NULL UNIQUE,
      email VARCHAR(50) NOT NULL UNIQUE,
      password VARCHAR (100) NOT NULL 
    );
  `);
  }

  static async findByUsername(username) {
    const { rows } = await pool.query(
      `SELECT id FROM users WHERE username = $1;`,
      [username]
    );

    return rows[0];
  }

  static async findByEmail(email) {
    const { rows } = await pool.query(`SELECT * FROM users WHERE email = $1;`, [
      email,
    ]);

    const parsedRows = toCamelCase(rows);

    return parsedRows[0];
  }

  static async insert(username, email, password) {
    const { rows } = await pool.query(
      `INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username;`,
      [username, email, password]
    );

    return rows[0];
  }
}

module.exports = User;
