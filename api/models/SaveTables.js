// api/models/Subscription.js

module.exports = {

    tableName: 'hightable_savetables',
    tableAlias: 'reviews',
    attributes: {
    is_saved: { type: 'number'},
    table_id: {
        model: 'tables',
        required: true,
        // min: 1
        
      },
    user_id: {
        model: 'users',
        required: true,
        // min: 1
      }
    }
  };
  