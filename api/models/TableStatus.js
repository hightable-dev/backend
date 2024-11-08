require('dotenv').config();


module.exports = {
    tableName: 'hightable_table_status',
    tableAlias: 'table_status',
    attributes: {
        // type: { type: 'string', isIn: ['standard', 'premium'], required: true },
        table_id: { type: 'number' },
        status: { type: 'number' },
        admin_id: { type: 'number' },
        // admin_type: { type: 'number'}, changed to user_type
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