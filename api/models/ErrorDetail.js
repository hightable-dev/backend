module.exports = {
  tableName: 'hightable_error_details',
  tableAlias: 'error_details',
  attributes: {
    table_id: { type: 'number' }, 
    user_id: { type: 'number' },
    type: { type: 'number' },
    creator_id: { type: 'number' },
    type_glossary: { type: 'string' },
    description: { type: 'string' },
    booking_id: { type: 'number', defaultsTo: 0  },
    error_details: { type: 'ref' },
    booking_details: { type: 'ref' },  /* order_id or payment_id */
    issued_at: { type: 'string' },
    status: { type: 'number', defaultsTo: 1 }  // Add type and default value for status
  },
};
