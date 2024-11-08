// api/models/Subscription.js

module.exports = {

    tableName: 'hightable_subscriptions',
    tableAlias: 'subscriptions',
    attributes: {
    is_subscribe: { type: 'boolean', required: false },
    status: { type: 'number', defaultsTo: 1 },

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
  