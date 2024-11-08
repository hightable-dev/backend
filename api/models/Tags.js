
/**
 * Users.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */


module.exports = {
    tableName: 'hightable_tags',
    tableAlias: 'tags',
    attributes: {
        tags: { type: 'string' },
    },
};