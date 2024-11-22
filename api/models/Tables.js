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
    location: { type: 'json', columnType: 'json' },
        inclusion: { type: 'string' },
    exclusions: { type: 'string' },
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

  handleExpiredBookings: async function (tableId, payPending, orederExpired) {
    const expiredBookings = await TableBooking.find({
      where: { table_id: tableId, status: payPending, expiry_date: { '<': new Date() } }
    });

    for (const booking of expiredBookings) {
      await TableBooking.updateOne({ id: booking.id }).set({ status: orederExpired });
    }
  },

  handleBooking: async function (tableId, payPending, orederExpired) {
    const data = await Tables.findOne({
      where: { id: tableId }
    });
    if (data.booked === data.max_seats) {

      const expiredBookings = await TableBooking.find({
        where: { table_id: tableId, status: payPending }
      });

      for (const booking of expiredBookings) {
        await TableBooking.updateOne({ id: booking.id }).set({ status: orederExpired });
      }
      return false;
    } else {
      return true;
    }
  },

  checkAvailableSeats: async function (tableId, seats, maxSeats, bookedSeats, payPending, paymentSuccess) {
    const totalBookedSeats = await TableBooking.sum('seats').where({
      table_id: tableId,
      status: [payPending, paymentSuccess]
    }) + seats;

    if (totalBookedSeats > maxSeats) {
      throw new Error(`Not enough available seats. Available seats: ${maxSeats - bookedSeats}`);
    }
  },

  checkPreviousBookings: async function (tableId, userId, status) {
    const data =  await TableBooking.findOne({ table_id: tableId, user_id: userId, status: status });
    return data ;

  },

  updateTableSeats: async function (tableId, paymentSuccess) {
    const confirmedBookedSeats = await TableBooking.sum('seats').where({
      table_id: tableId,
      status: [paymentSuccess]
    });

    await Tables.updateOne({ id: tableId }).set({ booked_seats: confirmedBookedSeats });
  },
};