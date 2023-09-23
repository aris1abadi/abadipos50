import ioClient from 'socket.io-client';

//const endpoint = 'http://192.168.100.119:3300/';
const endpoint = 'https://pos-server.lesehanpundong01.my.id';
//const endpoint = 'http://192.168.123.114:3300/';


const socket = ioClient(endpoint);
export const io = socket;
