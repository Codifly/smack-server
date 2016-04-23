// Set up environment
import 'source-map-support/register';
import 'babel-polyfill';

import express from 'express';
import http from 'http';
import SocketIo from 'socket.io';
import chatRoom from './chatroom';

// Basic setup of express server and socket.io
const app = express();
const server = http.createServer(app);
const io = SocketIo(server);
const port = process.env.PORT || 9001;

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

// Create a chatroom that uses socket.io.
chatRoom(io);
