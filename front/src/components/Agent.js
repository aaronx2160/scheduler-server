import * as React from "react";
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Typography,
  Modal,
  Grid,
  styled,
  TextField,
} from "@mui/material";
import {
  getRemotes,
  postRemoteStatus,
  searchTicketPost,
  changePswdPost,
} from "../api";
import { style } from "./Style";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

class Agent extends React.Component {
  state = {
    agent: "",
    rows: [],
    open: false,
    rowData: {},
    updateInterval: null,
    hidden: true,
    unconfirmedLength: 0,
    pswdOpen: false,
    pswdErr: "",
    pswdErrShow: false,
  };

  async componentDidMount() {
    let agentName = localStorage.getItem("agent");

    agentName ? this.setState({ agent: agentName }) : window.history.back();
    const rowData = await this.getTableData(agentName);
    this.setState({ rows: rowData });
    this.updateRowsData();
  }

  componentWillUnmount() {
    clearInterval(this.state.updateInterval);
  }

  getTableData = async (agentName) => {
    const { unconfirmedLength } = this.state;
    const confirmedArr = [];
    const unconfirmedArr = [];
    const data = await getRemotes(agentName);
    data.forEach((remoteObj) => {
      let receivedDateStr = new Date(
        parseInt(remoteObj.timeReceived)
      ).toLocaleString();
      remoteObj.timeReceived = receivedDateStr;
      if (remoteObj.status === 0) {
        unconfirmedArr.push(remoteObj);
      } else {
        confirmedArr.push(remoteObj);
      }
    });

    if (unconfirmedArr.length > unconfirmedLength) {
      document.title = "\uD83D\uDD34 New remote";
      const audio = new Audio(require("../audio/alert.wav"));
      try {
        await audio.play();
      } catch (error) {}
    } else if (unconfirmedArr.length > 0) {
      document.title = "\uD83D\uDD34 Unconfirmed remote(s)";
    } else document.title = "Sophos Home Scheduler";
    await this.setState({ unconfirmedLength: unconfirmedArr.length });

    return [...unconfirmedArr, ...confirmedArr];
  };
  handleConfirm = (data) => {
    return () => {
      this.setState({ rowData: data, open: true });
    };
  };

  handleDone = async () => {
    let { id } = this.state.rowData;
    const { status } = await postRemoteStatus(id);
    if (status === "ok") {
      await this.setState({ open: false });
      const rowData = await this.getTableData(this.state.agent);
      this.setState({ rows: rowData });
    }
  };

  updateRowsData = () => {
    const updateInterval = setInterval(async () => {
      const rowData = await this.getTableData(this.state.agent);
      await this.setState({ rows: rowData });
    }, 5000);
    this.setState({ updateInterval });
  };

  handleSearchChange = async (e) => {
    clearInterval(this.state.updateInterval);
    let ticketNum = e.target.value;
    if (ticketNum.trim() === "") {
      const rowData = await this.getTableData(this.state.agent);
      await this.setState({ rows: rowData, hidden: true });
      await this.updateRowsData();
      return;
    }
    searchTicketPost(e.target.value).then((data) => {
      if (data.length < 1) {
        this.setState({ hidden: false, rows: [] });
      } else {
        console.log(data);

        data.forEach((remoteObj) => {
          let receivedDateStr = new Date(
            parseInt(remoteObj.timeReceived)
          ).toLocaleString();
          remoteObj.timeReceived = receivedDateStr;
        });

        this.setState({ hidden: true, rows: data });
      }
    });
  };

  handlePswdSubmit = async (event) => {
    const { agent } = this.state;
    const { handlePswdErr } = this;
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const oldPswd = data.get("oldPswd").trim();
    const newPswd = data.get("newPswd").trim();
    const newPswdMatch = data.get("newPswdMatch").trim();
    if (oldPswd === "" || newPswd === "") {
      handlePswdErr("Error: the fileds can't be empty");
      return;
    }
    if (newPswd.length < 6) {
      handlePswdErr("Error: New password should be at least 6 characters");
      return;
    }
    if (newPswd !== newPswdMatch) {
      handlePswdErr("Error: New password does not match");
      return;
    }

    changePswdPost({ agent, oldPswd, newPswd, newPswdMatch }).then((res) => {
      console.log(res);
      if (res.msg !== "ok") {
        handlePswdErr(res.msg);
      } else {
        handlePswdErr(res.msg);
        setTimeout(() => {
          this.setState({ pswdOpen: false });
        }, 3000);
      }
    });
  };
  handlePswdErr = (err) => {
    if (err !== "") {
      this.setState({ pswdErr: err });
      this.setState({ pswdErrShow: true });
      setTimeout(() => {
        this.setState({ pswdErr: "" });
        this.setState({ pswdErrShow: false });
      }, 3000);
    }
  };
  handleSignOut = () => {
    localStorage.setItem("agent", "");
    window.history.back();
  };
  render() {
    const {
      rows,
      open,
      rowData,
      agent,
      hidden,
      pswdOpen,
      pswdErr,
      pswdErrShow,
    } = this.state;
    return (
      <div>
        <Card style={{ width: "80%", margin: "2% auto" }}>
          <Grid container spacing={2}>
            <Grid item xs={4} md={4}>
              <Item>Hello {agent}!</Item>
            </Grid>
            <Grid item xs={4} md={4}>
              <Item>
                <TextField
                  label="Search ticket#"
                  type="search"
                  placeholder="Ticket #"
                  onChange={this.handleSearchChange}
                  size="small"
                />
              </Item>
            </Grid>
            <Grid item xs={4} md={4}>
              <Item>
                <button
                  style={{
                    borderWidth: "0",
                    color: "white",
                    backgroundColor: "#00a152",
                    borderRadius: "5px",
                  }}
                  onClick={() => this.setState({ pswdOpen: true })}
                >
                  PASSWORD
                </button>
                <button
                  style={{
                    borderWidth: "0",
                    color: "white",
                    backgroundColor: "#b26500",
                    marginLeft: "5px",
                    borderRadius: "5px",
                  }}
                  onClick={this.handleSignOut}
                >
                  SIGN OUT
                </button>
              </Item>
            </Grid>
          </Grid>
          <Item hidden={hidden}>
            <Typography>No data found</Typography>
          </Item>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Time Received</TableCell>
                  <TableCell align="center">Ticket#</TableCell>
                  <TableCell align="center">Agent</TableCell>
                  <TableCell align="center">Halifax Time</TableCell>
                  <TableCell align="center">CX Time & Time Zone</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                    }}
                  >
                    <TableCell align="center">{row.timeReceived}</TableCell>
                    <TableCell align="center">{row.ticketNum}</TableCell>
                    <TableCell align="center">{row.agentName}</TableCell>
                    <TableCell align="center">{row.halifaxTime}</TableCell>
                    <TableCell align="center">
                      {row.userTime + " (" + row.timeZone + ")"}
                    </TableCell>
                    <TableCell align="center">
                      {row.status ? (
                        <Button
                          variant="outlined"
                          size="small"
                          color="success"
                          disabled
                        >
                          confirmed
                        </Button>
                      ) : (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={this.handleConfirm(row)}
                        >
                          unconfirmed
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
        <Modal
          open={open}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              Please let cx know via email the remote is now confirmed! Ticket#:
              {rowData ? rowData.ticketNum : ""}
            </Typography>
            <Button
              color="primary"
              size="small"
              variant="outlined"
              style={{ marginLeft: "80%" }}
              onClick={this.handleDone}
            >
              Done
            </Button>
          </Box>
        </Modal>
        <Modal
          open={pswdOpen}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box
            sx={[
              style,
              {
                "& .MuiTextField-root": {
                  m: 1,
                  width: "25ch",
                  display: "flex",
                  flexDirection: "column",
                  margin: "0 auto",
                },
              },
            ]}
            component="form"
            noValidate
            autoComplete="off"
            onSubmit={this.handlePswdSubmit}
          >
            <TextField
              required
              id="oldPswd"
              name="oldPswd"
              label="Old password"
              size="small"
              type="password"
              style={{ marginBottom: "10px" }}
            />
            <TextField
              required
              id="newPswd"
              name="newPswd"
              label="New password"
              size="small"
              type="password"
              style={{ marginBottom: "10px" }}
            />
            <TextField
              required
              id="newPswdMatch"
              name="newPswdMatch"
              label="New password again"
              size="small"
              type="password"
              style={{ marginBottom: "10px" }}
            />
            <div style={{ marginLeft: "30%" }}>
              <Button
                color="primary"
                size="small"
                variant="outlined"
                type="submit"
              >
                Submit
              </Button>
              <Button
                color="warning"
                size="small"
                variant="outlined"
                onClick={() => this.setState({ pswdOpen: false })}
                style={{ marginLeft: "10px" }}
              >
                Cancel
              </Button>
            </div>
            <p
              style={{
                color: pswdErr === "ok" ? "green" : "red",
              }}
              hidden={!pswdErrShow}
            >
              {pswdErr}
            </p>
          </Box>
        </Modal>
      </div>
    );
  }
}

export default Agent;
