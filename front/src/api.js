import axios from "axios";

axios.defaults.baseURL = "http://192.168.9.43:4000/";
// axios.defaults.baseURL = "http://18.190.152.23/";

export const getInitialData = (token) =>
  axios
    .post("initialData", { token })
    .then((data) => {
      return data.data;
    })
    .catch((err) => {
      console.log(err);
    });

export const getAgents = () =>
  axios
    .get("agents")
    .then((data) => {
      return data.data;
    })
    .catch((err) => {
      console.log(err);
    });

export const login = (data) =>
  axios
    .post("login", data)
    .then((data) => {
      return data.data;
    })
    .catch((err) => {
      console.log(err);
    });

export const postDateSlected = (date, UserTimezone) =>
  axios
    .post("date", { date, UserTimezone })
    .then((data) => {
      return data.data;
    })
    .catch((err) => {
      console.log(err);
    });

export const postTimeSubmit = (data) =>
  axios
    .post("remote", data)
    .then((data) => {
      return data.data;
    })
    .catch((err) => {
      console.log(err);
    });

export const getRemotes = (agent) =>
  axios
    .get("remotes/" + agent)
    .then((data) => {
      return data.data;
    })
    .catch((err) => {
      console.log(err);
    });

export const searchTicketPost = (ticketNum) =>
  axios
    .post("ticketNum", { ticketNum })
    .then((data) => {
      return data.data;
    })
    .catch((err) => {
      console.log(err);
    });

export const postRemoteStatus = (id) =>
  axios
    .post("remotes/status", { id })
    .then((data) => {
      return data.data;
    })
    .catch((err) => {
      console.log(err);
    });

export const testApi = () =>
  axios
    .get("test")
    .then((data) => {
      return data.data;
    })
    .catch((err) => {
      console.log(err);
    });
