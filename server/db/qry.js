
module.exports = {
  selectQuery: function(query) {
    return `SELECT `+ query +` FROM users WHERE username=?;`;
  },
  matchSessionId: `SELECT sessionId from users WHERE sessionId=?;`,
  getAllFromUsername: `SELECT * from users WHERE username=?;`,
  getSessionFromUsername: `SELECT sessionId from users WHERE username=?;`,
 	insertUser: `INSERT INTO users SET ?`,
 	updateUser: `UPDATE users SET ? WHERE username=?;`,

}
