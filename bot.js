const { OW_TOKEN, DEV_ID, PLAYLIST_ID, CHANNEL_ID, AUTH_URL, HOST_URL } = require("./setup.js");
const { getAuthCode, getInitialToken, getRefreshedToken} = require("./auth.js");
const axios = require("axios");
const {connect, getToken, saveToken} = require("./tokenManager");

let validToken = false;
let ACCESS_TOKEN = "";
let REFRESH_TOKEN = "";

console.log('opening client connection')
const socket = require('socket.io-client')(`${HOST_URL}`);
    
socket.on('connect', () => {
    console.log('auth client connected');
})

const startOWBot = client => {
    client.login(OW_TOKEN);

    client.on("ready", async () => {
    console.log(`Logged in as ${client.user.tag}!`);
        await client.user.setActivity("High on Humans", { type: "LISTENING" });
        //read in refresh token (if it exists)
        await connect();

        REFRESH_TOKEN = await getToken();
        if(REFRESH_TOKEN){
            validToken = true;
            newToken = await getRefreshedToken(REFRESH_TOKEN);
            ACCESS_TOKEN = newToken.access_token;
            REFRESH_TOKEN = newToken.refresh_token? newToken.refresh_token : REFRESH_TOKEN;
            const expiry = newToken.expires_in;
            invalidateToken(expiry);
        }
        //console.log(REFRESH_TOKEN)
    });

    client.on("message", msg => {
        listener(msg, client);
    });

};

const listener = async (msg, client) => {
    if (msg.channel.id == CHANNEL_ID) {
        const message = msg.content.split("\n");
        message.forEach(async line => {
            if (line.startsWith("https://open.spotify.com/track")) {
                const song_id = getSongId(line);
                //console.log(song_id);
                const success = await addToPlaylist(song_id, msg);
                if(success){
                    await msg.react('✅');
                }
              
            }
        });
    }
    
    if (msg.content == "!auth" && msg.author.id == DEV_ID) {
        await msg.channel.send("Please use this link to connect me to Spotify!\n"+AUTH_URL);
        try {
            const code = await getAuthCode(socket);
            const tokens = await getInitialToken(code);

            //console.log(tokens);

            REFRESH_TOKEN = tokens.refresh_token;
            ACCESS_TOKEN = tokens.access_token;
            const expiry = tokens.expires_in;
            validToken = true;

            //save token to db
            console.log(REFRESH_TOKEN);
            await saveToken(REFRESH_TOKEN);

            //set timer to invalidate token 1 minute before actual expiry time
            invalidateToken(expiry);
        } catch (e) {
            if(e.toString().includes('timed out')){
                await msg.channel.send(e);
            } else {
                await msg.channel.send("Error with Spotify authentication");
                console.log(e);
            }
        }
    }
};

const addToPlaylist = async (song_id, msg) => {
    let attemptedRetry = false;
    while(true){
        try {
            if (validToken) {
                //await msg.channel.send(`adding song id "${song_id}" to playlist`)
                const url = `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/tracks`;
    
                const { data: result } = await axios.post(
                    url, {
                        uris: [`spotify:track:${song_id}`]
                    }, {
                        headers: { Authorization: "Bearer " + ACCESS_TOKEN }
                    }
                );
                return true;
            } else {
                //token expired, revalidate token
                if(attemptedRetry){
                    await msg.channel.send('API Error');
                    return false;
                }
                attemptedRetry = true;
                console.log("refreshing token");
                const newToken = await getRefreshedToken(REFRESH_TOKEN);
                if (newToken == null) {
                    await msg.channel.send("something went wrong generating new token");
                    return false;
                }
                ACCESS_TOKEN = newToken.access_token;
                if(newToken.refresh_token){
                    console.log('recieved new refresh token');
                } else {
                    console.log('reusing refresh token');
                }
                REFRESH_TOKEN = newToken.refresh_token ? newToken.refresh_token : REFRESH_TOKEN;
                const expiry = newToken.expires_in;
                validToken = true;
                
                invalidateToken(expiry);
            }
        } catch (e) {
            await msg.channel.send("something went wrong");
            console.log(e);
            return false;
        }
    }
};

const getSongId = url => {
    const idx = url.indexOf("?");
    return idx == -1 ? url.slice(31) : url.slice(31, idx);
};

const invalidateToken = delayInSeconds => {
    setTimeout(() => {
        console.log("invalidating token now");
        validToken = false;
    }, delayInSeconds * 1000);
};

module.exports = startOWBot;
