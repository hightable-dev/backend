const crypto = require('crypto');
/**
 * Encrypt Decrypt phone.
 */

module.exports = (() => {
    // Declare variables inside the IIFE (Immediately Invoked Function Expression)
    const algorithm = process.env.PHONE_CRYPTO_ALGORITHM;
    const cipher_key = process.env.PHONE_CRYPTO_CIPHER_KEY;
    const cipher_iv = process.env.PHONE_CRYPTO_CIPHER_IV;

    return {
        /**
         * Encrypt the provided phone number.
         *
         * @param {String|Number} phone - Phone number to be encrypted
         * @return {String} - Encrypted text in hex format
         */
        encryptPhone(phone) {
            console.log(algorithm);

            try {
                let cipher = crypto.createCipheriv(algorithm, cipher_key, cipher_iv);
                let encrypted = cipher.update(phone.toString());
                encrypted = Buffer.concat([encrypted, cipher.final()]);
                return encrypted.toString('hex');
            } catch (err) {
                console.error("Encryption failed: ", err);
                throw new Error("Failed to encrypt phone number.");
            }
        },

        /**
         * Decrypt the provided encrypted text.
         *
         * @param {String} encryptedText - Encrypted text in hex format to be decrypted
         * @return {String} - Decrypted phone number as a string
         */
        decryptPhone(encryptedText) {
            try {
                let encryptedBuffer = Buffer.from(encryptedText, 'hex');
                let decipher = crypto.createDecipheriv(algorithm, cipher_key, cipher_iv);
                let decrypted = decipher.update(encryptedBuffer);
                decrypted = Buffer.concat([decrypted, decipher.final()]);
                return decrypted.toString();
            } catch (err) {
                console.error("Decryption failed: ", err);
                throw new Error("Failed to decrypt the phone number.");
            }
        }
    };
})();
