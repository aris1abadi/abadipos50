import ioClient from 'socket.io-client';

//const endpoint = 'http://192.168.100.119:3300/';
//const endpoint = 'https://pos-server.lesehanpundong01.my.id';
const endpoint = 'http://192.168.110.23:3300/';
//const endpoint = 'http://103.82.92.90:3300';

const socket = ioClient(endpoint);
export const io = socket;
