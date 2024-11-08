/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

/* global UtilsService */

/**
 * RefreshToken
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    tableName: 'hightable_refresh_tokens',
    tableAlias: 'refresh_token',
    attributes: {
          user_id: {
              type: 'ref',
              required: true
          },
          client_id: {
              type: 'string',
              required: true
          },
          token: {
              type: 'string'
          }
    },
    beforeCreate: function(values, next){
      values.token = UtilsService.uid(256);
      next();
    }
};
