module.exports = {
  tableName: "hightable_notification",
  tableAlias: "notification",
  attributes: {
    // user_id: { type: 'string', maxLength: 1000, required: true },
    type: { type: "string", maxLength: 1000 },
    read: { type: "boolean", defaultsTo: false },
    is_paid: { type: "boolean"},
    status: { type: "number" },
    template_id: { type: "string"},

    table_id: {
      model: "tables",
      columnName: 'table_id',
    },
    follow_user: {
      model: "profilemembers",
      columnName: 'follow_user',
    },
    receiver: {
      model: "profilemembers",
      columnName: 'receiver',
    },
    sender: {
      model: "profilemembers",
    },
    message:{ type: "string", maxLength: 1000 },
    pay_order_id:{type : "string"}
  },
};
