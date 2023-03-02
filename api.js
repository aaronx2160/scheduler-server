const path = require("path");
const axios = require("axios");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
var localeData = require("dayjs/plugin/localeData");
const conn = require("./db");
const generateToken = require("./token");

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localeData);

const officeHoursConverted = [];
const officeHoursStr = [
  "09",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
];
let agentNameParam = "";
let ticketNumParam = "";

const api = (app) => {
  app.get("/page/*", async (req, res) => {
    try {
      res.sendFile(path.join(__dirname, "build", "index.html"));
    } catch (error) {
      console.log(error);
    }
  });

  app.get("/client/:agentName/:ticketNum", async (req, res) => {
    agentNameParam = "";
    ticketNumParam = "";
    try {
      agentNameParam = req.params.agentName;
      ticketNumParam = req.params.ticketNum;
      let currentTime = Date();
      const selectAllTokensSql = "select * from tokens";
      conn(selectAllTokensSql, [], (selectAllTokensErr, selectAllTokensRes) => {
        if (selectAllTokensErr) {
          console.log(selectAllTokensErr);
          res.sendFile(path.join(__dirname, "build", "index.html"));
        } else {
          if (selectAllTokensRes.length > 0) {
            selectAllTokensRes.map((item) => {
              if (currentTime - item["submitTime"] > 86400000) {
                const delOldTokensSql = "delete from tokens where id =?";
                conn(
                  delOldTokensSql,
                  [item["id"]],
                  (delOldTokensErr, delOldTokensRes) => {
                    if (delOldTokensErr) {
                      console.log(delOldTokensErr);
                    }
                  }
                );
              }
            });
            res.sendFile(path.join(__dirname, "build", "index.html"));
          } else {
            res.sendFile(path.join(__dirname, "build", "index.html"));
          }
        }
      });
    } catch (error) {
      console.log(error);
    }
  });

  //login page, get agents list
  app.get("/agents", async (req, res) => {
    try {
      const sql = "select * from agents";
      conn(sql, [], (err, ress) => {
        if (err) {
          console.log(err);
        } else {
          res.send(ress);
        }
      });
    } catch (error) {
      res.send(error);
    }
  });

  app.post("/login", (req, res) => {
    try {
      let { agent, password } = req.body;
      const sql = "select password from agents where ?? =?";
      conn(sql, ["name", agent], (err, ress) => {
        if (err) {
          console.log(err);
        } else {
          if (password === ress[0]["password"]) {
            res.send(agent);
          } else {
            res.send("error");
          }
        }
      });
    } catch (error) {
      console.log(error);
    }
  });
  //initial page load
  app.post("/initialData", async (req, res) => {
    try {
      const { token } = req.body;
      let sql = "select * from tokens where token =? and agentName =?";
      conn(sql, [token, agentNameParam], (err, ress) => {
        if (err) {
          console.log(err);
        } else {
          if (ress.length > 0) {
            res.send({ agentNameParam, ticketNumParam, token });
          } else {
            const token = generateToken();
            const tokenCreateTime = Date.now();
            const sqll = "insert into tokens (??,??,??,??) values(?,?,?,?);";
            conn(
              sqll,
              [
                "token",
                "agentName",
                "ticketNum",
                "submitTime",
                token,
                agentNameParam,
                ticketNumParam,
                tokenCreateTime,
              ],
              (err, ress) => {
                if (err) {
                  console.log(err);
                } else {
                  res.send({ agentNameParam, ticketNumParam, token });
                }
              }
            );
          }
        }
      });
    } catch (error) {
      res.send(error);
    }
  });

  app.post("/date", (req, res) => {
    try {
      console.log(req.body);
      let { date, UserTimezone } = req.body;
      let dateObj = dayjs(date);
      const clientTime = dayjs.tz(dateObj, UserTimezone);
      const halifaxTime = dayjs.tz(dateObj, "America/Halifax");

      officeHoursConverted.length = 0;
      let d = 0;

      clientTime.get("date") > halifaxTime.get("date")
        ? (d = halifaxTime.get("date") + 1)
        : (d = halifaxTime.get("date"));

      let month = parseInt(halifaxTime.get("month") + 1);
      let year = halifaxTime.get("year");

      for (let i = 0; i < officeHoursStr.length; i++) {
        let d1 = dayjs.tz(
          year + "-" + month + "-" + d + " " + officeHoursStr[i] + ":00",
          "America/Halifax"
        );
        let timestamp = dayjs.utc(d1, "YYYY-MM-DD HH:mm:ss");

        timestamp = dayjs(timestamp).tz(UserTimezone);
        officeHoursConverted.push(timestamp.format("MMM D, hh:mm A"));
      }

      res.send({ officeHoursConverted, agentNameParam, ticketNumParam });
    } catch (error) {
      res.send(error);
    }
  });

  app.post("/remote", async (req, res) => {
    try {
      const { time, agent, ticketNum, userTimeZone, token } = req.body;
      let dateObj = dayjs.tz("2023" + time, userTimeZone);
      const userTime = dayjs
        .tz(dateObj, userTimeZone)
        .format("MMM-DD-YYYY HH:mm:ss A");

      const halifaxTime = dayjs
        .tz(dateObj, "America/Halifax")
        .format("MMM-DD-YYYY HH:mm:ss A");

      // let timeReceived = dayjs().tz("America/Halifax");
      // .format("MMM-DD-YYYY HH:mm:ss A");
      let timeReceived = Date.now();

      const checkSubmitTimeSql = "select * from remotes where ticketNum =?";
      conn(
        checkSubmitTimeSql,
        [ticketNum],
        (checkSubmitTimeSqlErr, checkSubmitTimeSqlRes) => {
          if (checkSubmitTimeSqlErr) {
            console.log(checkSubmitTimeSqlErr);
            return;
          } else {
            //if(checkSubmitTimeSqlRes[0][])
            let submitTime =
              checkSubmitTimeSqlRes.length > 0
                ? checkSubmitTimeSqlRes[0]["timeReceived"]
                : null;
            let checkTime = Date.now();
            console.log(checkTime - submitTime);
            if (submitTime && checkTime - submitTime < 900000) {
              res.send({
                msg: "Last remote request was submitted less than 15 minutes agao. Please try again later",
              });
            } else {
              const validationSql = "select * from tokens where ?? =?";
              conn(validationSql, ["token", token], (err, ress) => {
                if (err) {
                  console.log(err);
                } else {
                  let ressAgentName = "";
                  let ressTicketNum = "";
                  ress.length > 0
                    ? (ressAgentName = ress[0]["agentName"])
                    : null;
                  ress.length > 0
                    ? (ressTicketNum = ress[0]["ticketNum"])
                    : null;
                  if (ressAgentName !== agent || ressTicketNum !== ticketNum) {
                    res.send({
                      msg: "invalid agent name or ticket number! Please close this page and start again by clicking the link from the email",
                    });
                  } else {
                    const checkTktExistSql =
                      "select * from remotes where ticketNum =?";
                    conn(
                      checkTktExistSql,
                      [ticketNum],
                      (TicketExistErr, ticketExistRes) => {
                        if (TicketExistErr) {
                          console.log(TicketExistErr);
                        } else {
                          if (ticketExistRes.length > 0) {
                            const updateRemoteSql =
                              "update remotes set agentName=?,halifaxTime=?,userTime=?,timeZone=?,timeReceived=?,status=? where ticketNum=?";
                            conn(
                              updateRemoteSql,
                              [
                                agent,
                                halifaxTime,
                                userTime,
                                userTimeZone,
                                timeReceived,
                                0,
                                ticketNum,
                              ],
                              (updateRemoteErr, updateRemoteRes) => {
                                if (updateRemoteErr) {
                                  console.log(updateRemoteErr);
                                } else {
                                  res.send({ msg: "ok" });
                                }
                              }
                            );
                          } else {
                            const insertRemoteSql =
                              "insert into remotes (??,??,??,??,??,??) values (?,?,?,?,?,?)";
                            conn(
                              insertRemoteSql,
                              [
                                "ticketNum",
                                "agentName",
                                "halifaxTime",
                                "userTime",
                                "timeZone",
                                "timeReceived",
                                ticketNum,
                                agent,
                                halifaxTime,
                                userTime,
                                userTimeZone,
                                timeReceived,
                              ],
                              (insertRemoteErr, insertRemoteRes) => {
                                if (insertRemoteErr) {
                                  console.log(insertRemoteErr);
                                } else {
                                  res.send({ msg: "ok" });
                                }
                              }
                            );
                          }
                        }
                      }
                    );
                  }
                }
              });
            }
          }
        }
      );
    } catch (error) {
      res.send(error);
    }
  });
  app.post("/ticketNum", (req, res) => {
    try {
      let { ticketNum } = req.body;
      const sql = "select * from remotes where ?? =?";
      conn(sql, ["ticketNum", ticketNum], (err, ress) => {
        if (err) {
          res.send(err);
        } else {
          res.send(ress);
        }
      });
    } catch (err) {
      console.log(err);
    }
  });
  app.get("/remotes/:agentName", async (req, res) => {
    try {
      console.log(req.params);
      const { agentName } = req.params;
      const sql =
        "select * from remotes where agentName =? order by id DESC limit 10";

      conn(sql, [agentName], (err, ress) => {
        if (err) {
          res.send(err);
        } else {
          res.send(ress);
        }
      });
    } catch (error) {
      res.send(error);
    }
  });

  app.post("/remotes/status", (req, res) => {
    try {
      let { id } = req.body;
      const sql = "update remotes set status = 1 where id =?";
      conn(sql, [id], (err, ress) => {
        if (err) {
          console.log(err);
        } else {
          res.send({ status: "ok" });
        }
      });
    } catch (error) {
      console.log(error);
    }
  });

  app.get("/test", (req, res) => {
    console.log("cleanup");
    res.send("test");
  });
};

module.exports = { api };
