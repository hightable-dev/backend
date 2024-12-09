const crypto = require('crypto');
/**
 * Encrypt Decrypt phone.
 */

module.exports = (() => {
    // Declare variables inside the IIFE (Immediately Invoked Function Expression)
    const algorithm = process.env.PHONE_CRYPTO_ALGORITHM;
    const cipher_key = process.env.PHONE_CRYPTO_CIPHER_KEY;
    const cipher_iv = process.env.PHONE_CRYPTO_CIPHER_IV;
    console.log({algorithm})

    return {
        /**
         * Encrypt the provided phone number.
         *
         * @param {String|Number} phone - Phone number to be encrypted
         * @return {String} - Encrypted text in hex format
         */
        encryptAppId(appId) {
            try {
                let cipher = crypto.createCipheriv(algorithm, cipher_key, cipher_iv);
                let encrypted = cipher.update(appId.toString());
                encrypted = Buffer.concat([encrypted, cipher.final()]);
                return encrypted.toString('hex');
            } catch (err) {
                throw new Error({ message: "Failed to encrypt phone number.", error: err });
            }
        },
        encryptAppSecret(appSecret) {
            try {
                let cipher = crypto.createCipheriv(algorithm, cipher_key, cipher_iv);
                let encrypted = cipher.update(appSecret.toString());
                encrypted = Buffer.concat([encrypted, cipher.final()]);
                return encrypted.toString('hex');
            } catch (err) {
                throw new Error({ message: "Failed to encrypt phone number.", error: err });
            }
        },

        /**
         * Decrypt the provided encrypted text.
         *
         * @param {String} encryptedText - Encrypted text in hex format to be decrypted
         * @return {String} - Decrypted phone number as a string
         */
        encryptAppId(encryptedText) {
            try {
                let encryptedBuffer = Buffer.from(encryptedText, 'hex');
                let decipher = crypto.createDecipheriv(algorithm, cipher_key, cipher_iv);
                let decrypted = decipher.update(encryptedBuffer);
                decrypted = Buffer.concat([decrypted, decipher.final()]);
                return decrypted.toString();
            } catch (err) {
                throw new Error("Failed to decrypt the phone number.", err);
            }
        },
        encryptAppSecret(encryptedText) {
            try {
                let encryptedBuffer = Buffer.from(encryptedText, 'hex');
                let decipher = crypto.createDecipheriv(algorithm, cipher_key, cipher_iv);
                let decrypted = decipher.update(encryptedBuffer);
                decrypted = Buffer.concat([decrypted, decipher.final()]);
                return decrypted.toString();
            } catch (err) {
                throw new Error("Failed to decrypt the phone number.", err);
            }
        }
    };
})();