import axios from 'axios';
import { getToken } from './auth';

export const baseURL = 'https://sgevideostreaming.herokuapp.com';

const api = axios.create({
  baseURL: 'https://sgevideostreaming.herokuapp.com',
  rejectUnauthorized: false,
});

export default api;
