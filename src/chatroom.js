import {
  addChannelMessage, addUserMessage, getChannels, getChannelMessages,
  getUserMessages, getUsers, login, logout
} from './repository';

// const EVERYONE_GROUP = 'Everyone';

/**
  * Chatroom that allows ...
  */
export default (io) => {
  io.on('connection', (socket) => {
    console.warn('Connection made.');

    // When the client emits 'message', send the message to the receiver.
    socket.on('userMessage', ({ message, userId }) => {
      const newMessage = addUserMessage(socket.userId, userId, message);

      if (newMessage) {
        // Send the message to the receiver.
        // newMessage = { id, message, timestamp, userId }
        console.warn('NEW MESSAGE', newMessage);
        io.to(userId).emit('receiveUserMessage', newMessage);
        // Send the message to the sender.
        // userId = receiver
        io.to(socket.userId).emit('sendUserMessage', { message: newMessage, userId });
      }
    });

    socket.on('channelMessage', ({ channelId, message }) => {
      const newMessage = addChannelMessage(socket.userId, channelId, message);

      if (newMessage) {
        // Send the message to the receiver.
        // newMessage = { id, message, timestamp }
        console.warn('NEW MESSAGE', newMessage);
        // Send the message to the sender.
        // channelId = receiver
        io.emit('receiveChannelMessage', { channelId, message: newMessage });
      }
    });

    // When the client emits 'userMessages', send the messages to the receiver.
    socket.on('userMessages', ({ userId }) => {
      // Send the 'messages' [{ message, timestamp, userId }] of the requested user
      // to the current client.
      const messages = getUserMessages(socket.userId, userId);
      console.warn('userMessages', messages);
      socket.emit('userMessages', { messages, userId });
    });

    // When the client emits 'channelMessages', send the messages to the receiver.
    socket.on('channelMessages', ({ channelId }) => {
      // Send the 'messages' [{ message, timestamp, userId }] of the requested user
      // to the current client.
      const messages = getChannelMessages(channelId);
      console.warn('channelMessages', messages);
      socket.emit('channelMessages', { channelId, messages });
    });

    // When the client emits 'joinChat', execute the following function.
    socket.on('joinChat', ({ username }) => {
      if (username) {
        console.warn('Join chat', username);
        // Login with this username.
        const user = login(username);
        // Store the userId in the socket session.
        socket.userId = user.id;
        // Create a room for this userId.
        socket.join(user.id);

        // Notify the user that just joined, to which users he can chat.
        const users = getUsers();
        socket.emit('users', users);

        // Tell everyone else that a new user has joined the chat.
        socket.broadcast.emit('joinedChat', user);
        console.warn('EMIT LOGIN', user);
        socket.emit('login', user);

        const channels = getChannels();

        channels.forEach(({ id }) => {
          const messages = getChannelMessages(id);
          socket.emit('channelMessages', { channelId: id, messages });
        });

        users.forEach(({ id }) => {
          const messages = getUserMessages(socket.userId, id);
          socket.emit('userMessages', { messages, userId: id });
        });
      }
    });

    // When the client emits 'startTyping', we notify the receiver.
    socket.on('startTyping', ({ userId }) => {
      // I'm (socket.userId) typing a message to send to you (userId)!
      socket.to(userId).emit('startTyping', { userId: socket.userId });
    });

    // When the client emits 'stopTyping', we notify the receiver.
    socket.on('stopTyping', ({ userId }) => {
      // I (socket.userId) stopped typing a message (to send to userId).
      socket.to(userId).emit('stopTyping', { userId: socket.userId });
    });

    socket.on('logout', () => {
      const user = logout(socket.userId);
      if (user) {
        // Tell everyone else that I'm leaving the place. Bye bye!
        socket.broadcast.emit('leftChat', user);
        socket.emit('logout');
      }
    });

    // When the client disconnects, logout.
    socket.on('disconnect', () => {
      const user = logout(socket.userId);
      if (user) {
        // Tell everyone else that I'm leaving the place. Bye bye!
        socket.broadcast.emit('leftChat', user);
        socket.emit('logout');
      }
    });
  });
};
