import ioClient from 'socket.io-client';

//const endpoint = 'http://192.168.100.119:3300/';
//const endpoint = 'http://localhost:3300/';
//const endpoint = 'https://api.abadinet.my.id/';
const endpoint = 'http://abadinet.my.id:3300/';


const socket = ioClient(endpoint);
export const io = socket;
