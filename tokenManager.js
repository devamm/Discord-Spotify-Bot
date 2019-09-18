const {KEY} = require('./setup')

const encrypt = (text) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
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

    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
    let decrypted = decipher.update(cipher_buffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString();
}