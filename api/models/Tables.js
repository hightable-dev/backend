require('dotenv').config();


module.exports = {
  tableName: 'hightable_tables',
  tableAlias: 'tables',
  attributes: {
    // type: { type: 'string', isIn: ['standard', 'premium'], required: true },
    full_name: { type: 'string' },
    type: { type: 'number', required: true },
    media: { type: 'string' },
    video: { type: 'string' },
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
    created_by: { type: 'ref' },
    event_date: { type: 'ref', columnType: 'timestamp', },
    reviews: { type: 'number' },
    // approved: { type: 'boolean', defaultsTo: false },
    status: { type: 'number' },
    admin_id: { type: 'number' },
    user_type: { type: 'number' },
    // expiry_date: { type: 'datetime' },
    location: { type: 'json', columnType: 'json' },
    event_done_flag: { type: 'boolean' },
    city: { type: 'string' },
    state: { type: 'string' },
    pincode: { type: 'string' },
    category: {
      model: 'Interests'
    },

    user_profile: {
      model: 'profilemembers' // Assuming 'UserProfiles' is the name of the model where user details like name are stored
    },
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
    return await TableBooking.findOne({ table_id: tableId, user_id: userId, status: status });
  },

  updateTableSeats: async function (tableId, payPending, paymentSuccess) {
    const confirmedBookedSeats = await TableBooking.sum('seats').where({
      table_id: tableId,
      status: [paymentSuccess]
    });

    await Tables.updateOne({ id: tableId }).set({ booked_seats: confirmedBookedSeats });
  },

  updateTablesCount: async function (profileMemberId) {
    try {
      const tablesCount = await Tables.count({
        created_by: profileMemberId,
        status: { '!=': [0, 6] }
      });
      const res = await ProfileMembers.updateOne({ id: profileMemberId }).set({ table_count: tablesCount });

    } catch (error) {
      sails.log.error('Error updating tables count:', error);
    }
  }


  // afterCreate: async function (newlyInsertedRecord, proceed) {
  //   try {
  //     // Determine the table status based on the type
  //     let tableStatus;
  //     if (newlyInsertedRecord.type === 'standard') {
  //       tableStatus = 'open';
  //     } else if (newlyInsertedRecord.type === 'premium') {
  //       tableStatus = 'pending';
  //     }

  //     // Update the newly inserted record with the determined table status
  //     await Tables.updateOne({ id: newlyInsertedRecord.id })
  //       .set({ table_status: tableStatus });

  //     // Proceed after updating the record
  //     return proceed();
  //   } catch (error) {
  //     // Handle error
  //     console.error("Error updating table status:", error);
  //     throw error;
  //   }
  // }

  // beforeCreate: async function (values, proceed) {
  //   try {
  //     // Generate invite link based on the category and the ID of the record
  //     const inviteLink = `https://yourwebsite.com/${values.category}/${values.id}/`;
  //     values.invite_link = inviteLink;

  //     // Proceed to create the record
  //     return proceed();
  //   } catch (error) {
  //     // Handle error
  //     console.error("Error generating invite link:", error);
  //     throw error;
  //   }
  // }

  // afterCreate: async function (newlyInsertedRecord, proceed) {
  //   try {
  //     // Generate invite link based on the category and the ID of the newly inserted record
  //     // const inviteLink = `${process.env.SERVICE_URL}/${newlyInsertedRecord.id}/category/${newlyInsertedRecord.category}/`;
  //     const inviteLink = `${process.env.SERVICE_URL}/v1/tables/${newlyInsertedRecord.id}`;

  //     // Update the newly inserted record with the generated invite link
  //     await Tables.updateOne({ id: newlyInsertedRecord.id })
  //       .set({ table_link: inviteLink });

  //     // Proceed after updating the record
  //     return proceed();
  //   } catch (error) {
  //     // Handle error
  //     console.error("Error updating invite link:", error);
  //     throw error;
  //   }
  // }
};