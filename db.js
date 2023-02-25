const mysql = require('mysql')
const pool = mysql.createPool(require('./key.json'))

module.exports = function (sql, placeHolder, callback) {
  pool.getConnection(function (conn_err, conn) {
    if (conn_err) {
      callback(conn_err, null)
    } else {
      conn.query(sql, placeHolder, function (query_err, result) {
        conn.release()
        conn.destroy()
        callback(query_err, result)
      })
    }
  })
}
