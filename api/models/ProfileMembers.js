
/**
 * Users.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

var bcrypt = require('bcryptjs');
var SALT_WORK_FACTOR = 10;

const shortid = require('shortid');
module.exports = {
    tableName: 'hightable_profile_members',
    tableAlias: 'profile_members',
    attributes: {
        // username: { type: 'ref', required: true },
        email: { type: 'ref', maxLength: 300 },
        // password: { type: 'string', maxLength: 300 },
        first_name: { type: 'string', maxLength: 300 },
        last_name: { type: 'string', maxLength: 300 },
        description: { type: 'string', maxLength: 300 },
        photo: { type: 'string', maxLength: 300 },
        phone: { type: 'ref' },
        street: { type: 'string' },
        address: { type: 'string' },
        city: { type: 'string' },
        state: { type: 'string' },
        postal_code: { type: 'string' },
        status: { type: 'number' },
        status_glossary: { type: 'string', maxLength: 100 },
        about_me: { type: 'string', maxLength: 300 },
        one_signal_push_tokens: { type: 'ref' },
        tokens: { type: 'ref' },
        last_active: { type: 'ref', columnType: 'timestamptz' },
        last_checkin_via: { type: 'string', maxLength: 100 },
        facebook_id: { type: 'string', allowNull: true },
        facebook_data: { type: 'ref' },
        linkedin_id: { type: 'string', allowNull: true },
        linkedin_data: { type: 'ref' },
        interests: { type: 'ref' },
        followers: { type: 'number' },
        google_id: { type: 'string', allowNull: true },
        google_data: { type: 'ref' },
        otp_session_id: { type: 'string', allowNull: true },
        reviews: { type: 'ref' },
        reviews_count: { type: 'number' },
        linked_account_id: { type: 'string' },
        linked_product_id: { type: 'string' },
        pronoun: { type: 'string' },
        instagram_data: { type: 'ref' },
        instagram_link: { type: 'string' },
        linkedin_link: { type: 'string' },
        x_link: { type: 'string' },
        x_data: { type: 'ref' },
        table_count: { type: 'number' },
        booked: { type: 'number' },
        age: { type: 'number' },
        gender: { type: 'string' },
        account_details : {type : 'ref'},
        profile_completion_status : {type : 'ref'},
        uu_id: {
            type: 'string'
        },
        account: {
            columnName: 'user',
            model: 'users'
        },

    },
    attributesMeta: {
        photo: {
            s3_folder: 'public/photo/members'
        },
    },
    beforeCreate: function (user, callback) {
        user.uu_id = shortid.generate(user);
        if (user.password) {
            bcrypt.hash(user.password, SALT_WORK_FACTOR, function (err, hash) {
                user.password = hash;
                return callback();
            });
        } else {
            return callback();
        }
    },
    beforeUpdate: function (user, callback) {
        if (user.password) {
            bcrypt.hash(user.password, SALT_WORK_FACTOR, function (err, hash) {
                user.password = hash;
                return callback();
            });
        } else {
            return callback();
        }
    }
};