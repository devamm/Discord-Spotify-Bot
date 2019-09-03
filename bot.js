const {OW_TOKEN, SPOTIFY_TOKEN, DEV_ID, PLAYLIST_ID, CHANNEL_ID} = require('./secrets.js');
const {getAuthCode, getInitialToken} = require('./auth.js')
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
                console.log(song_id);
                //addToPlaylist(song_id, msg);
            }  
        })   
    }

    if(msg.content == '!auth' && msg.author.id == DEV_ID){
       
        await msg.channel.send('Please use this link to connect me to Spotify!\nhttp://localhost:8080/auth');
        try{
            const code = await getAuthCode();
            getInitialToken(code);
            //console.log('CODE:'+code);
        } catch(e){
            await msg.channel.send('Error with Spotify authentication')
        }
        
    }
}

const addToPlaylist = async(song_id, msg) => {
    try{
        //await msg.channel.send(`adding song id "${song_id}" to playlist`)
        const url = `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/tracks`;
        
        const {data: result} = await axios.post(url, {
            uris: [`spotify:track:${song_id}`]
        }, {
            headers: {Authorization: 'Bearer '+SPOTIFY_TOKEN}
        });
    
    } catch(e){
        await msg.channel.send('something went wrong');
        console.log(e);
    }
}

const getSongId = (url) => {
    const idx = url.indexOf('?');
    return idx == -1? url.slice(31) : url.slice(31, idx);
}


module.exports = startOWBot;