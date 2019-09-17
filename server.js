const express = require('express');
const {PORT} = require('./setup.js');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const server =  app.listen(PORT, () => {
    console.log(`spotify test server listening on port ${PORT}!`)
});

console.log('creating server socket');
const io = require('socket.io')(server);


module.exports = {io};

app.use('/', require('./routes'));
app.get("*", (req, res) => {
    res.send("I am a bot. Hello!");
});