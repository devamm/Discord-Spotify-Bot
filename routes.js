const router = require("express").Router();
const {SPOTIFY_CLIENT, CALLBACK_URL} = require('./secrets.js');


router.get('/auth', (req, res) => {
    const scopes = 'playlist-read-collaborative playlist-modify-public';
    res.redirect('https://accounts.spotify.com/authorize' +
        '?response_type=code' +
        '&client_id=' + SPOTIFY_CLIENT +
        (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
        '&redirect_uri=' + encodeURIComponent(CALLBACK_URL)
    );
})

router.get("/success", (req, res) => {
    res.send('success!');
    
    const code = req.query['code'].trim();
    //console.log(`access code:${code}`)
    console.log('!CODE'+code);
    process.exit(0);
})


module.exports = router;
