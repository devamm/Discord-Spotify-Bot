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

module.exports = startOWBot;