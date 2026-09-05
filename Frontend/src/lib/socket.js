import { io } from 'socket.io-client';
import { BASE_URL } from '../services/api';

// When BASE_URL is relative ("/api"), stripping the suffix leaves "" —
// pass undefined instead so socket.io-client connects to the current
// page's origin rather than an invalid empty URL.
const SOCKET_URL = BASE_URL.replace(/\/api\/?$/, '') || undefined;

export const socket = io(SOCKET_URL, { autoConnect: true });
