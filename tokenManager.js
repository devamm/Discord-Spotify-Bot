const {KEY, MONGO_URI} = require('./setup')
const MongoClient = require('mongodb').MongoClient;
const crypto = require('crypto');

const client = new MongoClient(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
let keys;

const connect = async () => {
    try{
        await client.connect();
        console.log('connected to db!');
        const db = client.db()
        keys = db.collection("keys");
    } catch(e){
        console.log(e);
    }
}

const encrypt = (text) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(KEY, 'hex'), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final(), iv]);
    return encrypted.toString('hex');
}

const decrpyt = (cipherText) => {
    //create buffer from cipher text
    const buffer = Buffer.from(cipherText, 'hex');
    //split buffer into buffer of cipher text and buffer of initialization vector (last 16 bytes)
    const cipherLength = buffer.length - 16;
    const cipher_buffer = buffer.slice(0, cipherLength);
    const iv = buffer.slice(cipherLength);

    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(KEY, 'hex'), iv);
    let decrypted = decipher.update(cipher_buffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString();
}

const saveToken = async (token) => {
    const cipher = encrypt(token);
    await keys.updateOne({idx:1}, {$set: {token: cipher}});
    console.log('saved encrpyted token to DB');
}

const getToken =  async () => {
    const data = await keys.find({idx:1}).toArray();
    if('token' in data[0]){
        return decrpyt(data[0].token)
    } else {
        return null;
    }
}

module.exports = {saveToken, getToken, connect}