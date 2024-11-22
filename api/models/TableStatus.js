require('dotenv').config();
const shortid = require('shortid');

module.exports = {
    tableName: 'hightable_table_status',
    tableAlias: 'table_status',
    attributes: {
        table_id: { type: 'number' },
        status: { type: 'number' },
        admin_id: { type: 'number' },
        user_type: { type: 'number' },
        table_creator_id: { type: 'number' },
        last_checkin_via: { type: 'string' },
        uu_id: {
            type: 'string'
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

}