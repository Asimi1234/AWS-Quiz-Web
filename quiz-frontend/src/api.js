import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE,
  headers: {
    "x-api-key": process.env.REACT_APP_API_KEY,
    "Content-Type": "application/json",
  },
});

export default api;
