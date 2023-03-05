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
import { getRemotes, postRemoteStatus, searchTicketPost } from "../api";
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
      } catch (error) {
        //console.log(error);
      }
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
        this.setState({ hidden: true, rows: data });
      }
      
    });
  };
  handleSignOut = () => {
    localStorage.setItem("agent", "");
    window.history.back();
  };
  render() {
    const { rows, open, rowData, agent, hidden } = this.state;
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
                  style={{ borderWidth: "0", color: "#E4A11B" }}
                  onClick={this.handleSignOut}
                >
                  Sign out
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
      </div>
    );
  }
}

export default Agent;
