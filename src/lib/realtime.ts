import ioClient from 'socket.io-client';

//const endpoint = 'http://192.168.100.119:3300/';
const endpoint = 'http://pos-server.lesehanpundong01.my.id';


const socket = ioClient(endpoint);
export const io = socket;
