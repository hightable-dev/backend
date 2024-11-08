/**
 * Interest.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'hightable_interests',
  tableAlias: 'interests',


  attributes: {
    name: { type: 'string', required: true },
    image: { type: 'string'},
    width: { type: 'number', defaultsTo: 50 },
    height: { type: 'number', defaultsTo: 50},
    status: { type: 'number'},
  },

  attributesMeta: {
    image: {
      // s3_folder: 'public/tables/media/'
        // s3_folder: 'public/video/user-profile'
        // s3_folder: 'public/video/tables'
        // s3_folder: 'public/media/tables'
        s3_folder: 'public/image/interests'
  
  
    },
  }
 
};
