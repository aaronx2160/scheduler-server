import * as React from "react";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import Grid from "@mui/material/Grid";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { CalendarPicker } from "@mui/x-date-pickers/CalendarPicker";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import {
  getInitialData,
  postDateSlected,
  postTimeSubmit,
  testApi,
} from "../api";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

dayjs.extend(timezone);

const calendarStyle = {
  position: "absolute",
  top: "30%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #fff",
  boxShadow: 24,
  p: 4,
};
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #fff",
  boxShadow: 24,
  p: 4,
};

function Client() {
  const navigate = useNavigate();
  const [userTimeZone, setUserTimeZone] = React.useState("");
  const [ticketNum, setTicketNum] = React.useState("");
  const [agent, setAgent] = React.useState("");
  const [officeHours, setOfficeHours] = React.useState([]);
  const [date, setDate] = React.useState(dayjs(new Date()));
  const [dateSliced, setDateSliced] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [time, setTime] = React.useState("");
  const [hidden, setHidden] = React.useState(true);
  const [error, setError] = React.useState("");
  const [cookies, setCookie] = useCookies(["token"]);

  React.useEffect(() => {
    let timeZone = dayjs.tz.guess();
    setUserTimeZone(timeZone);
    getInitialData(cookies.token).then((data) => {
      console.log(data);
      setAgent(data.agentNameParam);
      setTicketNum(data.ticketNumParam);
      setCookie("token", data.token, { path: "/", maxAge: 3600 });
      setAgent("Aaron");
      setTicketNum("123456");
    });
  }, []);

  const handleDateChange = (newDate) => {
    setHidden(true);
    setDate(newDate);
    console.log(cookies.token);
    let dateStr = newDate.$d.toString();
    setDateSliced(dateStr.slice(0, 15));
    setOfficeHours([]);
    postDateSlected(dateStr, userTimeZone).then((data) => {
      console.log(data);
      setAgent(data.agentNameParam);
      setTicketNum(data.ticketNumParam);
      setOfficeHours(data.officeHoursConverted);
      setOpen(true);
    });
  };

  const handleClose = () => setOpen(false);

  const handTimeleSelect = (event) => {
    setTime(event.target.value);
    setHidden(true);
  };
  const handleSubmit = () => {
    if (time === "") {
      setError("Please select a start time!");
      setHidden(false);
      return;
    }

    if (agent === "" || ticketNum === "") {
      setError("Invalid agent name or ticket number!");
      setHidden(false);
      return;
    }

    let { token } = cookies;
    postTimeSubmit({ time, agent, ticketNum, userTimeZone, token }).then(
      (data) => {
        if (data.msg === "ok") {
          setOpen(false);
          setHidden(true);
          navigate("/page/remoteSaved");
        } else {
          setError(data.msg);
          setHidden(false);
        }
      }
    );
  };
  const disableWeekends = (date) => {
    return date.$W === 0 || date.$W === 6;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid>
        <Grid item xs={12} md={6}>
          <Card sx={calendarStyle}>
            <Typography variant="h6" component="div">
              Sophos Home Remote Session Scheduler
            </Typography>
            <Typography sx={{ mb: 1.5 }} color="text.secondary">
              Please pick a date.
            </Typography>
            <CalendarPicker
              date={date}
              onChange={handleDateChange}
              disablePast={true}
              shouldDisableDate={disableWeekends}
            />
          </Card>
        </Grid>
      </Grid>
      <div>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Please choose a time.
            </Typography>
            <Typography id="modal-modal-description" color="text.secondary">
              Note: The office hours may appear uncommon after converting to
              your local time due to Sophos Home Support is based in North
              America.
            </Typography>

            <table style={{ borderSpacing: "15px" }}>
              <tbody>
                <tr>
                  <td>
                    <TextField
                      id="outlined-basic"
                      label="Ticket#"
                      variant="outlined"
                      disabled={true}
                      defaultValue={ticketNum}
                    />
                  </td>
                  <td>
                    <TextField
                      id="outlined-basic"
                      label="Agent"
                      disabled={true}
                      defaultValue={agent}
                      variant="outlined"
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <TextField
                      id="outlined-basic"
                      label="Date Selected"
                      disabled={true}
                      defaultValue={dateSliced}
                      variant="outlined"
                    />
                  </td>
                  <td>
                    <TextField
                      id="outlined-basic"
                      label="Time Zone"
                      disabled={true}
                      defaultValue={userTimeZone}
                      variant="outlined"
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <InputLabel id="demo-simple-select-label">
                      Start Time
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={time}
                      label="Start Time"
                      onChange={handTimeleSelect}
                      style={{ width: "150px" }}
                    >
                      {officeHours.map((item, i) => {
                        return (
                          <MenuItem key={item} value={item}>
                            {item}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </td>
                </tr>
              </tbody>
            </table>
            <Typography
              id="modal-modal-description"
              style={{ color: "red" }}
              hidden={hidden}
            >
              {error}
            </Typography>
            <Button
              style={{ marginLeft: "40%" }}
              variant="contained"
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </Box>
        </Modal>
      </div>
    </LocalizationProvider>
  );
}

export default Client;
