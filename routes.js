const router = require("express").Router();
const {SPOTIFY_CLIENT, CALLBACK_URL} = require('./setup.js');
const {io} = require('./server')

let authWindow = false;
let socket;

// socket.on('auth', () => {
//     authWindow = true;
//     console.log('opened auth window');
// })

io.on('connection', (socket) => {
    console.log('server socket connected');
    //console.log(socket);
    sock = socket;
    sock.on('request', () => {
        //console.log('window now open');
        authWindow = true;
    })
})



router.get('/auth', (req, res) => {  
    if(authWindow) {
        const scopes = 'playlist-read-collaborative playlist-modify-public';
        res.redirect('https://accounts.spotify.com/authorize' +
        '?response_type=code' +
        '&client_id=' + SPOTIFY_CLIENT +
        (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
        '&redirect_uri=' + encodeURIComponent(CALLBACK_URL));
    } else {
        res.send('No Authentication session in progress right now')
    }
})

router.get("/success", (req, res) => {
  
    if(authWindow){
        res.send('success!');
        authWindow = false;
        const code = req.query['code'].trim();
        sock.emit('code', {code})
    } else {
        res.sendStatus(403);
    }
   
})


module.exports = router;
