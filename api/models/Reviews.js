// api/models/Subscription.js

module.exports = {

  tableName: 'hightable_reviews',
  tableAlias: 'reviews',
  attributes: {
    reviews: { type: 'number' },
    comments: { type: 'string' },
    table_id: {
      model: 'tables',
      columnName: 'table_id', 
      required: true,
      // min: 1

    },
    reviewer_profile_id : {type:'number'},
    creator_profile_id: {
      model: 'profilemembers',
      columnName: 'creator_profile_id', 
      required: true,
      // min: 1
    },


  }

};
