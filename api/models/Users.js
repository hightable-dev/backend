
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
    tableName: 'hightable_users',
    tableAlias: 'users',
    attributes: {
        username: { type: 'ref', required: true },
        email: { type: 'string', maxLength: 300 },
        password: { type: 'string', maxLength: 300 },
        first_name: { type: 'string', maxLength: 300 },
        last_name: { type: 'string', maxLength: 300 },
        types: { type: 'ref'},
        // photo: { type: 'string', maxLength: 300 },
        // phone: { type: 'string', maxLength: 300 },
        status: { type: 'number' },
        status_glossary: { type: 'string', maxLength: 100 },
        // about_me: { type: 'string', maxLength: 300 },
        one_signal_push_tokens: { type: 'ref' },
        tokens: { type: 'ref' },
        last_active: { type: 'ref', columnType: 'timestamptz' },
        last_checkin_via: { type: 'string', maxLength: 100 },
        facebook_id: { type: 'string', allowNull: true },
        facebook_data: { type: 'ref' },
        linkedin_id: { type: 'string', allowNull: true },
        linkedin_data: { type: 'ref' },
        onesignal_player_ids: { type: 'ref' },
        google_id: { type: 'string', allowNull: true },
        google_data: { type: 'ref' },
        apple_id: { type: 'string', allowNull: true },
        apple_data: { type: 'ref' },
        // interests: { type: 'ref' },
        otp_session_id: { type: 'string', allowNull: true },
        // reviews: { type: 'ref' },
        uu_id: {
            type: 'string'
        },

        profile_admin: {
            columnName: "profile_admin",
            model: "profileadmin",
        },
        profile_members: {
            columnName: "profile_members",
            model: "profilemembers",
        },
        profile_managers: {
            columnName: "profile_managers",
            model: "profilemanagers",
        },
        

    },
    attributesMeta: {
        photo: {
            s3_folder: 'public/photo/users'
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