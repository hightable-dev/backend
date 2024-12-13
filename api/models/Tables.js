require('dotenv').config();

module.exports = {
  tableName: 'hightable_tables',
  tableAlias: 'tables',
  attributes: {
    full_name: { type: 'string' },
    type: { type: 'number', required: true },
    media: { type: 'ref' },
    video: { type: 'ref' },
    description: { type: 'string' },
    phone: { type: 'string' },
    min_seats: { type: 'number', min: 1, required: true },
    max_seats: { type: 'number', min: 1, required: true },
    booked_seats: { type: 'number' },
    booked: { type: 'number' },
    bookmarks: { type: 'number' },
    followers: { type: 'number' },
    title: { type: 'string', required: true },
    price: { type: 'number', required: true, min: 0 },
    tags: { type: 'string' },
    address: { type: 'string' },
    city: { type: 'string' },
    event_date: { type: 'ref', columnType: 'timestamp', },
    reviews: { type: 'number' },
    user_type: { type: 'number' },
    status: { type: 'number' },
    admin_id: { type: 'number' },
    event_done_flag: { type: 'boolean' },
    state: { type: 'string' },
    district: { type: 'string' },
    pincode: { type: 'string' },
    order_by: { type: 'string' },
    table_expense: { type: 'number' },
    location_details: { type: 'ref' },
    location: { type: 'json', columnType: 'json' },
        inclusion: { type: 'string', allowNull: true },
    exclusions: { type: 'string', allowNull: true },
    category: {
      model: 'Interests'
    },
    created_by: {
      model: 'profilemembers' // Assuming 'UserProfiles' is the name of the model where user details like name are stored
    },
    user_profile: {
      model: 'profilemembers' // Assuming 'UserProfiles' is the name of the model where user details like name are stored
    },
    format_geo_address: {type: 'string'}
  },
  attributesMeta: {
    media: {
      s3_folder: 'public/photo/tables',
      s3_folder_video: 'public/video/tables'
    },

  },
};