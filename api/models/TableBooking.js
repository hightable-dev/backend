// api/models/TableBooking.js

module.exports = {

    tableName: 'hightable_table_booking',
    tableAlias: 'table_booking',
    attributes: {
    table_id: {
        model: 'tables',
        columnName: 'table_id', 
        required: true,
      },
    user_id: {
        model: 'ProfileMembers',
        columnName: 'user_id', 
        required: true,
      },
    order_id: { type: 'string' },
    seats: { type: 'number' },
    // capture_id: { type: 'string' },
    payment_id: { type: 'string' },
    expires_at: { type: 'number' },
    amount: { type: 'number' },
    status : { type: "number" },
    expiry_date: { type: 'ref'},
    payment_details: { type: 'json', columnType: 'json' },
    refund_details: {type : 'json'},
    event_done_flag : { type : 'boolean'},
    creator_id: {type : 'ref'}
    // event_done_flag: {type : 'ref'}
    }
    
  };
  