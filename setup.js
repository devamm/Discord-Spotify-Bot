require('dotenv').config;

let secret = undefined;

if(!process.env.NODE_ENV){
    //only load from secrets if no environment variable present (local deploy)
    console.log('getting secrets from local secret file');
    secret = require('./secrets.js');
}

const OW_TOKEN = secret ? secret.OW_TOKEN : process.env.OW_TOKEN;
const SPOTIFY_CLIENT = secret ? secret.SPOTIFY_CLIENT : process.env.SPOTIFY_CLIENT;
const CALLBACK_URL = secret ? secret.CALLBACK_URL : process.env.CALLBACK_URL;
const DEV_ID = secret ? secret.DEV_ID : process.env.DEV_ID;
const SPOTIFY_SECRET = secret ? secret.SPOTIFY_SECRET: process.env.SPOTIFY_SECRET;
const CHANNEL_ID = secret ? secret.CHANNEL_ID : process.env.CHANNEL_ID;
const PLAYLIST_ID = secret ? secret.PLAYLIST_ID : process.env.PLAYLIST_ID;
const AUTH_URL = secret ? secret.AUTH_URL : process.env.AUTH_URL;
const PORT = secret ? 8080 : process.env.PORT;
const HOST_URL = secret ? 'http://localhost:8080' : process.env.HOST_URL;
const KEY = secret ? secret.KEY : process.env.AES_KEY;


module.exports = {OW_TOKEN, SPOTIFY_CLIENT, CALLBACK_URL, DEV_ID, SPOTIFY_SECRET, CHANNEL_ID, PLAYLIST_ID, AUTH_URL
, PORT, HOST_URL};