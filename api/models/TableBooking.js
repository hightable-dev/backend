// api/models/TableBooking.js

module.exports = {
  tableName: "hightable_table_booking",
  tableAlias: "table_booking",
  attributes: {
    order_id: { type: "string" },
    seats: { type: "number" },
    payment_id: { type: "string" },
    amount: { type: "number" },
    status: { type: "number" },
    payment_details: { type: "json", columnType: "json" },
    refund_details: { type: "json" },
    event_done_flag: { type: "boolean" },
    table_details: {type : 'ref'},
    creator_details: {type : 'ref'},
    user_details: {type : 'ref'},
    expiry_date: {type : 'ref'},
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
