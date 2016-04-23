import { expect } from 'chai';
import io from 'socket.io-client';
// Start chat server.
import '../src';

const socketURL = 'http://localhost:9001';
const options = {
  transports: [ 'websocket' ],
  'force new connection': true
};

describe('Chat server', () => {

  before((done) => {
    // Wait until server is started.
    setTimeout(done, 10000);
  });

  it('joinChat', (done) => {
    const client1 = io(socketURL, options);

    client1.on('connect_error', (error) => {
      console.log(error);
    });

    client1.on('connect', () => {
      client1.emit('joinChat', { username: 'Kristof' });

      const client2 = io.connect(socketURL, options);

      client2.on('connect', () => {
        client2.emit('joinChat', { username: 'Arvid' });

      });
      client1.on('users', (users) => {
        console.warn('users', users);
        client1.disconnect();
        client2.disconnect();
        done();
      });

    });

    client1.on('login', ({ username }) => {
      expect(username).to.equal('Arvid');
    });

  });

});
