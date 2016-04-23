import uuid from 'uuid';
import { OFFLINE_STATUS, ONLINE_STATUS } from './statusTypes';

const channels = [ { id: 'everyone', name: 'Global Smack' } ];
const users = []; // [ { id, status, username } ]

const userMessages = {}; // { receiverUserId: { senderUserId: [{ id, message, timestamp }] } }
const channelMessages = {
  everyone: []
};

export function getChannels () {
  return channels;
}

export function getUsers () {
  return users;
}

export function addUserMessage (fromUserId, toUserId, message) {
  console.warn('add message', userMessages, fromUserId, toUserId);
  // Only add a message if the users exist, and there is a message to send.
  if (userMessages[fromUserId] && userMessages[toUserId] && message && fromUserId !== toUserId) {
    // We store the message and the unix timestamp.
    const newMessage = { id: uuid.v4(), message, timestamp: new Date().getTime(), userId: fromUserId };
    // Store the message in both message boxes (receiver and sender).
    userMessages[fromUserId][toUserId] = userMessages[fromUserId][toUserId] || [];
    userMessages[toUserId][fromUserId] = userMessages[toUserId][fromUserId] || [];
    userMessages[fromUserId][toUserId].push(newMessage);
    userMessages[toUserId][fromUserId].push(newMessage);
    return newMessage;
  }
}

export function addChannelMessage (fromUserId, toChannelId, message) {
  // Only add a message if the user exist, and there is a message to send.
  if (userMessages[fromUserId] && channelMessages[toChannelId] && message) {
    // We store the message and the unix timestamp.
    const newMessage = { id: uuid.v4(), message, timestamp: new Date().getTime(), userId: fromUserId };
    // Store the message in both message boxes (receiver and sender).
    channelMessages[toChannelId].push(newMessage);
    return newMessage;
  }
}

/**
  * Get the messages for a conversation.
  * @param {string} fromUserId The user id of the current client.
  * @param {string} toUserId The user id of the client who you're talking to.
  * @return {array} An array of messages [{ id, message, timestamp, userId }].
  */
export function getUserMessages (fromUserId, toUserId) {
  return userMessages[fromUserId][toUserId] || [];
}

export function getChannelMessages (channelId) {
  return channelMessages[channelId];
}

export function login (username) {
  let index = -1;

  // Search the username.
  for (let i = 0; i < users.length; i++) {
    if (users[i].username === username) {
      index = i;
      break;
    }
  }

  let user = users[index];

  // The user was already logged in. Remove him from the list first, then
  // change his status to logged in.
  if (user) {
    users.splice(index, 1);
    user.status = ONLINE_STATUS;
  } else {
    // Create a new user.
    user = { id: uuid.v4(), status: ONLINE_STATUS, username };
  }

  // Add the user to the front.
  users.unshift(user);

  // Create a hash to store the messages, if there is none.
  userMessages[user.id] = userMessages[user.id] || {};

  // Return { id, status, username }.
  return user;
}

export function logout (userId) {
  let user;

  // Search the user.
  for (let i = 0; i < users.length; i++) {
    if (users[i].id === userId) {
      user = users[i];
      break;
    }
  }

  // Set the status of the user to offline (if he was logged in).
  if (user) {
    user.status = OFFLINE_STATUS;
  }

  // Return { id, status, username } or undefined (if user was not yet logged in).
  return user;
}
