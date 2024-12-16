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
require('dotenv').config();

const algorithm = process.env.PHONE_CRYPTO_ALGORITHM;
const cipher_key = process.env.PHONE_CRYPTO_CIPHER_KEY;
const cipher_iv = process.env.PHONE_CRYPTO_CIPHER_IV;

exports.encrypt = function (phone, callback) {
    //Encryption
    let cipher = crypto.createCipheriv(algorithm, cipher_key, cipher_iv);
    let encrypted = cipher.update(phone.toString());
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const encrypted_text = encrypted.toString('hex');
    return callback(encrypted_text);
};

exports.decrypt = function (text, callback) {
    let encryptedText = Buffer.from(text, 'hex');
    let decipher = crypto.createDecipheriv(algorithm, cipher_key, cipher_iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    const decrypted_text = decrypted.toString();
    return callback(decrypted_text);
};
