// api/models/Subscription.js

module.exports = {

    tableName: 'hightable_followers_users',
    tableAlias: 'followersusers',
    attributes: {
    // followers: { type: 'number'},
    status: { type: 'number'},
    follower_id: {
        model: 'tables',
        columnName: 'follower_id', // Map the 'category' field in this model to the 'id' field in the 'Interest' model
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
  