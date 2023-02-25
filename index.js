const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const { api } = require('./api.js')

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

api(app)

app.listen(4000, () => {
  console.log(`booking app listening on port 4000`)
})
