/**
 *
 * @author Prathap Punniyamoorthi <prathap.p@studioq.co.in>

 *
 */

/**
 * Client.js
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    tableName: 'hightable_clients',
    tableAlias: 'client',
    attributes: {
          name: {
              type: 'string',
              required: true,
              unique: true
          },
          redirect_uri: {
              type: 'string',
              required: true
          },
          client_id: 'string',
          client_secret: 'string',
          trusted: {
              type: 'boolean',
              defaultsTo: false
          }
    },
    beforeCreate: function(values, next){
        values.client_id = UtilsService.uidLight(10);
        values.client_secret = UtilsService.uid(30);
        next();
    }
};
