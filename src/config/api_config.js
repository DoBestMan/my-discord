import axios from 'axios';
import { DISCORD_SERVER } from '../shared/constants/urls';

// const address = localStorage.getItem('apiAddress') || DISCORD_SERVER;
const address = 'https://192.168.4.250:5000/';

const API = axios.create({
  baseURL: `${address}api/`,
  timeout: 50000,
});

export default {
  login(data) {
    return API.post('sign-in', data);
  },
  register(data) {
    return API.post('sign-up', data);
  },
  logMessage(data) {
    return API.post('log-message', data);
  },
  logFile(data) {
    return API.post('log-file', data);
  },
  backupFile(data) {
    return API.post('backup-file', data);
  },
  logCall(data) {
    return API.post('log-call', data);
  },
};
