const md5 = require('md5')

let secret = 'sophos'
const generateToken = () => {
  let timestamp = Date.now()
  return md5(secret + timestamp)
}

module.exports = generateToken
