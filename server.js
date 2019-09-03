const express = require('express');

const app = express();
const port = 8080;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', require('./routes.js'));

app.listen(port, () => {
    console.log(`spotify test server listening on port ${port}!`)
})