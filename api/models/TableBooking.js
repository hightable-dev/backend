// api/models/TableBooking.js

module.exports = {
  tableName: "hightable_table_booking",
  tableAlias: "table_booking",
  attributes: {
    order_id: { type: "string" },
    seats: { type: "number" },
    // capture_id: { type: 'string' },
    payment_id: { type: "string" },
    expires_at: { type: "number" },
    amount: { type: "number" },
    status: { type: "number" },
    expiry_date: { type: "ref" },
    payment_details: { type: "json", columnType: "json" },
    refund_details: { type: "json" },
    event_done_flag: { type: "boolean" },
    // creator_id: { type: "ref" },
    
    table_info: {type : 'ref'},
    creator_info: {type : 'ref'},
    user_info: {type : 'ref'},
    table_id: {
      model: "tables",
      columnName: "table_id",
      required: true,
    },
    creator_id: {
      model: "ProfileMembers",
      columnName: "creator_id",
      required: true,
    },
    user_id: {
      model: "ProfileMembers",
      columnName: "user_id",
      required: true,
    },
    remarks: { type: "ref" },
    status_glossary : { type: "string" }

  },
};
