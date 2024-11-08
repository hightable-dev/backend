/**
 *
 * @author mohan<mohan@studioq.co.in>
 *
 */

/* global _ */

/**
 * Return a unique identifier with the given `len`.
 *
 *     utils.uid(10);
 *     // => "FDaS435D2z"
 *
 * @param {Number} len
 * @return {String}
 * @api private
 */

var crypto = require('crypto');

//DO NOT CHANGE THESE KEYS AT ANY COST
const algorithm = 'aes-256-cbc';
const cipher_key = 'HOPap4rM9BDhe2pujepyvM5gzPROFILE';
const cipher_iv = '2636752361276683';

exports.encrypt = function (phone, callback) {
    //Encryption
    let cipher = crypto.createCipheriv(algorithm, cipher_key, cipher_iv);
    let encrypted = cipher.update(phone.toString());
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    encrypted_text = encrypted.toString('hex');
    return callback(encrypted_text);
};

exports.decrypt = function (text, callback) {
    //Decryption
    let encryptedText = Buffer.from(text, 'hex');
    let decipher = crypto.createDecipheriv(algorithm, cipher_key, cipher_iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    decrypted_text = decrypted.toString();
    return callback(decrypted_text);
};
