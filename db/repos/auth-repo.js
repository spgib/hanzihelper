const pool = require('../pool');

class AuthRepo {
  static async findUserByUsername(username) {
    const { rows } = await pool.query(
      `SELECT id FROM users WHERE username = $1;`,
      [username]
    );

    return rows[0];
  }

  static async findUserByEmail(email) {
    const { rows } = await pool.query(
      `SELECT * FROM users WHERE email = $1;`,
      [email]
    );

    return rows[0];
  }

  static async insertUser(username, email, password) {
    const { rows } = await pool.query(
      `INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username;`,
      [username, email, password]
    );

    return rows[0];
  }
}

module.exports = AuthRepo;