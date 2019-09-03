const {spawn} = require('child_process');
const {SPOTIFY_CLIENT, SPOTIFY_SECRET, CALLBACK_URL} = require('./secrets.js');
const axios = require('axios');
const querystring = require('querystring');

const getAuthCode = () => {
    const process = spawn('node', ['server']);

    return new Promise((resolve, reject) => {
        try{
            process.stdout.on('data', data => {
                data = data.toString();
                if(data.startsWith('!CODE')){
                    data = data.trim();
                  
                    resolve(data.slice(5));
                }
            })
        } catch(e){
            reject(e);
        }
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
    }
}

module.exports = {getAuthCode, getInitialToken, getRefreshedToken};