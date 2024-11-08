
// /**
//  * Users.js
//  *
//  * @description :: A model definition.  Represents a database table/collection/etc.
//  * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
//  */

module.exports = {
    tableName: 'hightable_standard_table',
    tableAlias: 'standard_table',
    attributes: {
        table_type: { type: 'number'},
        price: { type: 'string'},
        admin_id: { type: 'number'},
        admin_type: { type: 'number'},
        last_checkin_via: { type: 'string'},
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
 
};

