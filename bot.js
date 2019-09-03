const {OW_TOKEN, SPOTIFY_TOKEN} = require('./secrets.js');
const axios = require('axios');
const playlist_id = "7cDYnkRj71sbiaAPjQS51V";

const startOWBot = (client) => {
	client.login(OW_TOKEN);

    client.on('ready', async () => {
        console.log(`Logged in as ${client.user.tag}!`);
        await client.user.setActivity('High on Humans', {type: 'LISTENING'});  
      });

      client.on('message', msg => {
        listener(msg, client);
      });
};

const listener = async(msg, client) => {
    //REPLACE CHANNEL ID W/ OW CHANNEL HERE
    if(msg.channel.id == '425766065524441091') {
        const message = msg.content.split('\n');
        message.forEach(line => {
            if(line.startsWith('https://open.spotify.com/track')){ 
                const song_id = getSongId(line);
                console.log(song_id);
                //addToPlaylist(song_id, msg);
            }  
        })   
    }
}

const addToPlaylist = async(song_id, msg) => {
    try{
        //await msg.channel.send(`adding song id "${song_id}" to playlist`)
        const url = `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`;
        
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