const path = require('path')
const axios = require('axios')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
var localeData = require('dayjs/plugin/localeData')
const conn = require('./db')
const RouterGuard = require('./RouterGuard')
const generateToken = require('./token')

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(localeData)

const officeHoursConverted = []
const officeHoursStr = [
  '09',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '20',
]
let agentNameParam = ''
let ticketNumParam = ''

const api = (app) => {
  app.get('/page/*', async (req, res) => {
    try {
      res.sendFile(path.join(__dirname, 'build', 'index.html'))
    } catch (error) {
      console.log(error)
    }
  })

  app.get('/client/:agentName/:ticketNum', async (req, res) => {
    agentNameParam = ''
    ticketNumParam = ''
    try {
      console.log(req.params)
      agentNameParam = req.params.agentName
      ticketNumParam = req.params.ticketNum
      res.sendFile(path.join(__dirname, 'build', 'index.html'))
    } catch (error) {
      console.log(error)
    }
  })

  //login page, get agents list
  app.get('/agents', async (req, res) => {
    try {
      const sql = 'select * from agents'
      conn(sql, [], (err, ress) => {
        if (err) {
          console.log(err)
        } else {
          res.send(ress)
        }
      })
    } catch (error) {
      res.send(error)
    }
  })

  app.post('/login', (req, res) => {
    try {
      let { agent, password } = req.body
      const sql = 'select password from agents where ?? =?'
      conn(sql, ['name', agent], (err, ress) => {
        if (err) {
          console.log(err)
        } else {
          if (password === ress[0]['password']) {
            res.send(agent)
          } else {
            res.send('error')
          }
        }
      })
    } catch (error) {
      console.log(error)
    }
  })
  //initial page load
  app.get('/initialData', async (req, res) => {
    try {
      const token = generateToken()
      res.send({ agentNameParam, ticketNumParam, token })
    } catch (error) {
      res.send(error)
    }
  })

  app.post('/date', (req, res) => {
    try {
      console.log(req.body)
      let { date, UserTimezone } = req.body
      let dateObj = dayjs(date)
      const clientTime = dayjs.tz(dateObj, UserTimezone)
      const halifaxTime = dayjs.tz(dateObj, 'America/Halifax')

      officeHoursConverted.length = 0
      let d = 0

      clientTime.get('date') > halifaxTime.get('date')
        ? (d = halifaxTime.get('date') + 1)
        : (d = halifaxTime.get('date'))

      let month = parseInt(halifaxTime.get('month') + 1)
      let year = halifaxTime.get('year')

      for (let i = 0; i < officeHoursStr.length; i++) {
        let d1 = dayjs.tz(
          year + '-' + month + '-' + d + ' ' + officeHoursStr[i] + ':00',
          'America/Halifax'
        )
        let timestamp = dayjs.utc(d1, 'YYYY-MM-DD HH:mm:ss')

        timestamp = dayjs(timestamp).tz(UserTimezone)
        officeHoursConverted.push(timestamp.format('MMM D, hh:mm A'))
      }

      res.send({ officeHoursConverted, agentNameParam, ticketNumParam })
    } catch (error) {
      res.send(error)
    }
  })

  app.post('/remote', async (req, res) => {
    let routerGuard = new RouterGuard()
    console.log(routerGuard)
    try {
      const { time, agent, ticketNum, userTimeZone } = req.body

      // let dateObj = dayjs('2023 ' + time)
      let dateObj = dayjs.tz('2023' + time, userTimeZone)

      const userTime = dayjs
        .tz(dateObj, userTimeZone)
        .format('MMM-DD-YYYY HH:mm:ss A')
      console.log({ userTime })
      const halifaxTime = dayjs
        .tz(dateObj, 'America/Halifax')
        .format('MMM-DD-YYYY HH:mm:ss A')
      console.log({ halifaxTime })
      let timeReceived = dayjs()
        .tz('America/Halifax')
        .format('MMM-DD-YYYY HH:mm:ss A')

      console.log({ timeReceived })

      let remote = {
        userTime,
        halifaxTime,
        agent,
        ticketNum,
        userTimeZone,
        timeReceived,
      }
      remote.confirmed = false

      const sql = 'insert into remotes (??,??,??,??,??,??) values (?,?,?,?,?,?)'
      conn(
        sql,
        [
          'ticketNum',
          'agentName',
          'halifaxTime',
          'userTime',
          'timeZone',
          'timeReceived',
          ticketNum,
          agent,
          halifaxTime,
          userTime,
          userTimeZone,
          timeReceived,
        ],
        (err, ress) => {
          if (err) {
            console.log(err)
          } else {
            res.send({ msg: 'ok' })
          }
        }
      )
    } catch (error) {
      res.send(error)
    }
  })
  app.post('/ticketNum', (req, res) => {
    try {
      let { ticketNum } = req.body
      const sql = 'select * from remotes where ?? =?'
      conn(sql, ['ticketNum', ticketNum], (err, ress) => {
        if (err) {
          res.send(err)
        } else {
          res.send(ress)
        }
      })
    } catch (err) {
      console.log(err)
    }
  })
  app.get('/remotes/:agentName', async (req, res) => {
    try {
      console.log(req.params)
      const { agentName } = req.params
      const sql =
        'select * from remotes where agentName =? order by id DESC limit 10'

      conn(sql, [agentName], (err, ress) => {
        if (err) {
          res.send(err)
        } else {
          res.send(ress)
        }
      })
    } catch (error) {
      res.send(error)
    }
  })

  app.post('/remotes/status', (req, res) => {
    try {
      let { id } = req.body
      const sql = 'update remotes set status = 1 where id =?'
      conn(sql, [id], (err, ress) => {
        if (err) {
          console.log(err)
        } else {
          res.send({ status: 'ok' })
        }
      })
    } catch (error) {
      console.log(error)
    }
  })
}

module.exports = { api }
