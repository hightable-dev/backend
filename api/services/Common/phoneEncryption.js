// const crypto = require('crypto');

console.log("phoneEncryption ================= calls multiple times")

// // DO NOT CHANGE THESE KEYS AT ANY COST
// const algorithm = process.env.PHONE_CRYPTO_ALGORITHM ;
// const cipher_key = process.env.PHONE_CRYPTO_CIPHER_KEY ;
// const cipher_iv = process.env.PHONE_CRYPTO_CIPHER_IV ;
// console.log({algorithm,cipher_key,cipher_iv})

// // PHONE_CRYPTO_ALGORITHM 
// // PHONE_CRYPTO_CIPHER_KEY
// // PHONE_CRYPTO_CIPHER_IV 

// /**
//  * Encrypt the provided phone number.
//  *
//  * @param {String|Number} phone - Phone number to be encrypted
//  * @return {String} - Encrypted text in hex format
//  */
// function encryptPhone(phone) {
//     try {
//         let cipher = crypto.createCipheriv(algorithm, cipher_key, cipher_iv);
//         let encrypted = cipher.update(phone.toString());
//         encrypted = Buffer.concat([encrypted, cipher.final()]);
//         return encrypted.toString('hex');
//     } catch (err) {
//         console.error("Encryption failed: ", err);
//         throw new Error("Failed to encrypt phone number.");
//     }
// }

// /**
//  * Decrypt the provided encrypted text.
//  *
//  * @param {String} encryptedText - Encrypted text in hex format to be decrypted
//  * @return {String} - Decrypted phone number as a string
//  */
// function decryptPhone(encryptedText) {
//     try {
//         let encryptedBuffer = Buffer.from(encryptedText, 'hex');
//         let decipher = crypto.createDecipheriv(algorithm, cipher_key, cipher_iv);
//         let decrypted = decipher.update(encryptedBuffer);
//         decrypted = Buffer.concat([decrypted, decipher.final()]);
//         return decrypted.toString();
//     } catch (err) {
//         console.error("Decryption failed: ", err);
//         throw new Error("Failed to decrypt the phone number.");
//     }
// }

// // Exporting the functions for use in other files
// module.exports = {
//     encryptPhone,
    // decryptPhone
// };

// // Example usage (in a different file):
// // const { encryptPhone, decryptPhone } = require('./yourFileName');
// // const phoneNumber = "9876543210";
// // const encryptedPhone = encryptPhone(phoneNumber);
// // console.log('Encrypted Phone:', encryptedPhone);

// // const decryptedPhone = decryptPhone(encryptedPhone);
// // console.log('Decrypted Phone:', decryptedPhone);
