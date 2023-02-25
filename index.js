const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const { api } = require('./api.js')

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

api(app)
const PORT = process.env.PORT || 4000
app.listen(4000, () => {
  console.log(`booking app listening on port ${PORT}`)
})
