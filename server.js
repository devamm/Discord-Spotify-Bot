const express = require('express');

const app = express();
const port = 8080;


app.listen(port, () => {
    console.log(`spotify test server listening on port ${port}!`)
})