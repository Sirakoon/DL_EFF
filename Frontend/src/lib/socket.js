import { io } from 'socket.io-client';
import { BASE_URL } from '../services/api';

const SOCKET_URL = BASE_URL.replace(/\/api\/?$/, '');

export const socket = io(SOCKET_URL, { autoConnect: true });
