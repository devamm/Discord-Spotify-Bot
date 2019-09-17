//const {spawn} = require('child_process');
const {SPOTIFY_CLIENT, SPOTIFY_SECRET, CALLBACK_URL, PORT} = require('./setup.js');


const axios = require('axios');
const querystring = require('querystring');


const getAuthCode = (socket) => {
    //console.log('notifying server to open window');
    socket.emit("request")
    //console.log(requestedAuth);
    return new Promise(async (resolve, reject) => {
        
        setTimeout(() => {
            socket.emit('timeout')
            reject('Request timed out. Please try again');
        }, 5*60*1000);
        
        socket.on('code', (data) => {
            //console.log(data);
            resolve(data.code);
        })
        //resolve(null);

    })    
};

const getInitialToken = async (authCode) => {
    try {
        const {data} = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
           grant_type: "authorization_code",
           code: authCode,
           redirect_uri: CALLBACK_URL,
           client_id: SPOTIFY_CLIENT,
           client_secret: SPOTIFY_SECRET
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        //console.log(data);
        return {
            refresh_token: data.refresh_token,
            access_token: data.access_token,
            expires_in: data.expires_in-60
        };
    } catch(e){
        console.log(e.response.data);
    }
}

const getRefreshedToken = async(refreshToken) => {
    try{
        const auth_token = Buffer.from(SPOTIFY_CLIENT+":"+SPOTIFY_SECRET).toString('base64');
        const {data} = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        }), {
            headers: {
                'Authorization': 'Basic '+auth_token,
                'Content-Type': 'application/x-www-form-urlencoded'    
            }
        });

        return {
            access_token: data.access_token,
            refresh_token: data.refresh_token? data.refresh_token : undefined,
            expires_in: data.expires_in-60
        };

    } catch(e){
        console.log(e.response.data);
        return null;
    }
}


module.exports = {getAuthCode, getInitialToken, getRefreshedToken};