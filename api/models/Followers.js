// api/models/Subscription.js

module.exports = {

  tableName: 'hightable_followers',
  tableAlias: 'followers',
  attributes: {
    follower_profile_id : {type:'ref'},
    status : {type:'number'},
    creator_profile_id: {
      model: 'profilemembers',
      columnName: 'creator_profile_id', 
      required: true,
      // min: 1
    },


  }

};
