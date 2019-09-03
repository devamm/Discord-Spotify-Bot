const {OW_TOKEN, DEV_ID, PLAYLIST_ID, CHANNEL_ID} = require('./secrets.js');
const {getAuthCode, getInitialToken, getRefreshedToken} = require('./auth.js')
const axios = require('axios');

let validToken = false;
let ACCESS_TOKEN = '';
let REFRESH_TOKEN = ''


const startOWBot = (client) => {
	client.login(OW_TOKEN);

    client.on('ready', async () => {
        console.log(`Logged in as ${client.user.tag}!`);
        await client.user.setActivity('High on Humans', {type: 'LISTENING'});  

        //read in refresh token (if it exists) 
      });

      client.on('message', msg => {
        listener(msg, client);
      });
};

const listener = async(msg, client) => {
    //REPLACE CHANNEL ID W/ OW CHANNEL HERE
    if(msg.channel.id == CHANNEL_ID ) {
        const message = msg.content.split('\n');
        message.forEach(line => {
            if(line.startsWith('https://open.spotify.com/track')){ 
                const song_id = getSongId(line);
                //console.log(song_id);
                addToPlaylist(song_id, msg);
            }  
        })   
    }

    if(msg.content == '!auth' && msg.author.id == DEV_ID){
       
        await msg.channel.send('Please use this link to connect me to Spotify!\nhttp://localhost:8080/auth');
        try{
            const code = await getAuthCode();
            const tokens = await getInitialToken(code);
            
            REFRESH_TOKEN = tokens.refresh_token;
            ACCESS_TOKEN = tokens.access_token;
            const expiry = tokens.expires_in;
            validToken = true

            //set timer to invalidate token 1 minute before actual expiry time
            invalidateToken(expiry);
        } catch(e){
            await msg.channel.send('Error with Spotify authentication')
        }
        
    }
}

const addToPlaylist = async(song_id, msg) => {
    let attemptedRefresh = false;
    
    while(true){
        try{
            if(validToken){
                //await msg.channel.send(`adding song id "${song_id}" to playlist`)
                const url = `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/tracks`;
            
                const {data: result} = await axios.post(url, {
                    uris: [`spotify:track:${song_id}`]
                }, {
                    headers: {Authorization: 'Bearer '+ACCESS_TOKEN}
                });
                break;
            } else {
                //token expired, revalidate token
                if(attemptedRefresh == true){
                    //subsequent failed attempts, return
                    await msg.channel.send('something went wrong generating new token');
                    break;
                }
                attemptedRefresh = true;
                //revalidate token
                console.log('refreshing token')
                const newToken = getRefreshedToken(REFRESH_TOKEN);
                ACCESS_TOKEN = newToken.access_token;
                REFRESH_TOKEN = newToken.refresh_token? newToken.refresh_token : REFRESH_TOKEN;
                const expiry = newToken.expires_in;

                invalidateToken(expiry);
            }
        
        } catch(e){
            await msg.channel.send('something went wrong');
            console.log(e.response.data);
            break;
        }
    }
}

const getSongId = (url) => {
    const idx = url.indexOf('?');
    return idx == -1? url.slice(31) : url.slice(31, idx);
}

const invalidateToken = (delayInSeconds) => {
    if(!delayInSeconds){
        return;
    }
    setTimeout(() => {
        console.log('invalidating token now')
        validToken = false;
    }, delayInSeconds*1000)
}

module.exports = startOWBot;