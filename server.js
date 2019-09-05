const express = require('express');
const {PORT} = require('./setup.js');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', require('./routes.js'));

app.get("*", (req, res) => {
    res.send("I am a bot. Hello!");
})

app.listen(PORT, () => {
    console.log(`spotify test server listening on port ${PORT}!`)
})