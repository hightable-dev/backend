// api/models/Subscription.js

module.exports = {

  tableName: 'hightable_payout_host',
  tableAlias: 'payouthost',
  attributes: {
    table_id: { type: 'number' },
    creator_id: { type: 'number' },
    users_count: { type: 'number' },
    user_attended_count: { type: 'number' },
    payout: { type: 'number' },
    pending_payment: { type: 'number' },
    total_payment: { type: 'number' }
    
  }

};
