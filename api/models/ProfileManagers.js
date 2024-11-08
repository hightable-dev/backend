
// /**
//  * Users.js
//  *
//  * @description :: A model definition.  Represents a database table/collection/etc.
//  * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
//  */

module.exports = {
    tableName: 'hightable_profile_managers',
    tableAlias: 'profile_managers',
    attributes: {
        first_name: { type: 'string'},
        last_name: { type: 'string'},
        email: { type: 'string', required: true, isEmail: true ,unique: true},
        // email: { type: 'string'},
        phone: { type: 'ref' },
        photo: { type: 'string' },
        // dob: { type: 'string',  },
        // gender: { type: 'string',  },
        // address: { type: 'string',  },
        // city: { type: 'string',  },
        // state: { type: 'string',  },
        // pincode: { type: 'string',  },
        // target: { type: 'number',  },
        // branch_id: { type: 'number',  },
        status_glossary: { type: 'string', allowNull: true },
        status: { type: 'number', allowNull: true },
        // user: { type: 'number', allowNull: true },
        account: {
            columnName: 'user',
            model: 'users'
        },
        uu_id: {
            type: 'string'
        },
    },
        attributesMeta: {
        
        photo: {
          s3_folder: "public/photo/managers",
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
       afterCreate: async function (profile, callback) {
            if (profile.id) {
                await Users.findOne({ id: profile.account }, async function (err, user) {
                    await Users.update({ id: profile.account }, { profile_managers: profile.id }, async function (err, updated_user) {
                        return callback();
                    });
                });
            } else {
                return callback();
            }
        }
};

