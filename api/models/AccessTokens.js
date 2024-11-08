/**
 *
  * @author Prathap Punniyamoorthi <prathap.p@studioq.co.in>

 *
 */

/**
 * AccessToken.js
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    tableName: 'hightable_access_tokens',
    tableAlias: 'token',
    attributes: {
          user_id: {
              type: 'ref',
              required: true
          },
          client_id: {
              type: 'ref',
              required: true
          },
          token: 'string',
          scope: 'string'
    },
    beforeCreate: function(values, next){
        values.token = UtilsService.uid(255);
        next();
    }
};
