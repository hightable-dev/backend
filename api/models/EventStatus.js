// api/models/Subscription.js

module.exports = {

  tableName: 'hightable_event_status',
  tableAlias: 'eventstatus',
  attributes: {
    table_id: { type: 'number' },
    creator_id: { type: 'number' },
    user_id: { type: 'number' },
    event_done_flag : { type : 'boolean'}
  }

};
