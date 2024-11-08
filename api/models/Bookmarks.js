// api/models/Subscription.js

module.exports = {

    tableName: 'hightable_bookmarks',
    tableAlias: 'bookmarks',
    attributes: {
    // bookmarks: { type: 'number'},
    status: { type: 'number'},
    creator_profile_id: { type: 'number'},
    table_id: {
        model: 'tables',
        columnName: 'table_id', // Map the 'category' field in this model to the 'id' field in the 'Interest' model
        required: true,
        // min: 1
        
      },
    user_id: {
        model: 'users',
        columnName: 'user_id', // Map the 'category' field in this model to the 'id' field in the 'Interest' model
        required: true,
        // min: 1
      }
    }
    
  };
  