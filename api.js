const path = require('path')
const axios = require('axios')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
var localeData = require('dayjs/plugin/localeData')
const conn = require('./db')

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(localeData)

let userTimeZone = ''
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

const api = (app) => {
  app.get('/page/*', async (req, res) => {
    try {
      res.sendFile(path.join(__dirname, 'public', 'index.html'))
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
  //initial page load
  app.get('/:ticketNum/:agent/*', async (req, res) => {
    userTimeZone = req.params[0]

    let agent1 = { name: 'aaron', password: 'abc123' }

    res.send(req.params)
  })

  app.post('/date', (req, res) => {
    try {
      let { date } = req.body
      let dateObj = dayjs(date)
      const clientTime = dayjs.tz(dateObj, userTimeZone)
      const halifaxTime = dayjs.tz(dateObj, 'America/Halifax')

      console.log(clientTime.get('date'))
      console.log(halifaxTime.get('date'))

      officeHoursConverted.length = 0
      let d = 0
      clientTime.get('date') > halifaxTime.get('date')
        ? (d = halifaxTime.get('date') + 1)
        : (d = halifaxTime.get('date'))
      //   let d = dateObj.get('date')
      let month = parseInt(halifaxTime.get('month') + 1)
      let year = halifaxTime.get('year')

      //   d = halifaxTime.get('date')

      for (let i = 0; i < officeHoursStr.length; i++) {
        let d1 = dayjs.tz(
          year + '-' + month + '-' + d + ' ' + officeHoursStr[i] + ':00',
          'America/Halifax'
        )
        let timestamp = dayjs.utc(d1, 'YYYY-MM-DD HH:mm:ss')

        timestamp = dayjs(timestamp).tz(userTimeZone)
        officeHoursConverted.push(timestamp.format('MMM D, hh:mm A'))
      }

      res.send({ officeHoursConverted })
    } catch (error) {
      res.send(error)
    }
  })

  app.post('/remote', async (req, res) => {
    try {
      const { time, agent, ticketNum, userTimeZone } = req.body

      let dateObj = dayjs('2023 ' + time)
      const userTime = dayjs
        .tz(dateObj, userTimeZone)
        .format('MMM-DD-YYYY HH:mm:ss A')
      const halifaxTime = dayjs
        .tz(dateObj, 'America/Halifax')
        .format('MMM-DD-YYYY HH:mm:ss A')

      let timeReceived = dayjs()
        .tz('America/Halifax')
        .format('MMM-DD-YYYY HH:mm:ss A')
      console.log(timeReceived)

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
            res.send(req.body)
          }
        }
      )
    } catch (error) {
      res.send(error)
    }
  })

  app.get('/remotes/:agentName', async (req, res) => {
    try {
      console.log(req.params)
      const { agentName } = req.params
      const sql = 'select * from remotes where agentName =? order by id DESC'

      conn(sql, [agentName], (err, ress) => {
        if (err) {
          console.log(err)
        } else {
          res.send(ress)
        }
      })
    } catch (error) {}
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

const toFormatTime = (openHrsArr) => {
  let openHoursFormatted = []
  let placeholderArr = []
  for (let i = 0; i < openHrsArr.length; i++) {
    if (openHrsArr[i] < 12) {
      openHoursFormatted.push(openHrsArr[i] + ':00 AM')
    } else if (openHrsArr[i] > 12 && openHrsArr[i] < 24) {
      openHoursFormatted.push(openHrsArr[i] - 12 + ':00 PM')
    } else if (openHrsArr[i] == 12) {
      openHoursFormatted.push(openHrsArr[i] + ':00 PM')
    } else if (openHrsArr[i] == 24) {
      openHoursFormatted.push('00:00 AM')
    } else if (openHrsArr[i] > 24) {
      placeholderArr.push(openHrsArr[i] - 24 + ':00 AM')
    }
  }

  return [...placeholderArr, ...openHoursFormatted]
}
