/* global _, ProfileManagers /sails */
const moment = require('moment');
require('dotenv').config();

module.exports = async function createOrder(req, res) {
  const { payPending, orederExpired, paymentSuccess, bookingConfirmationPendingByCreator, createOrderErr,expiryDate  } = UseDataService;

  const { id } = req.body;
  let responseObject = {};

  const data = ['order_id', 'table_id', 'user_id', 'seats', 'creator_id', 'status_glossary'];
  const profileId = req.user.profile_members;
  const postRequestData = req.body;
  const seats = 1;
  let filteredPostData = _.pick(postRequestData, data);

  let input_attributes = [
    { name: 'order_id', required: true },
    { name: 'table_id', required: true },
    { name: 'user_id', required: true },
    { name: 'seats', required: true },
    { name: 'creator_id', required: true },
    { name: 'status_glossary' },
  ];

  const sendResponse = (details) => {
    responseObject = {
      message: 'Table booked .',
      details: _.cloneDeep(details)
    };
    return res.ok(responseObject);
  };

  const handleTableBooking = async () => {
    const isCheckdata = await UseDataService.checkTableCreatedByCurrentUser(
      {
        tableId: id,
        userId: ProfileMemberId(req)
      }
    )
    const isBookingAvailable = await Tables.handleBooking(id, payPending, orederExpired);
    const isAlreadyBookedAndPending = await Tables.checkPreviousBookings(id, profileId, payPending);
    const isAlreadyBookedAndSuccess = await Tables.checkPreviousBookings(id, profileId, paymentSuccess);

    const isBooked = await Tables.checkPreviousBookings(id, profileId, bookingConfirmationPendingByCreator);
    if (isCheckdata) {
      return { error: 'You cannot book for your table.', statusCode: 400 };
    } else if (!isBookingAvailable) {
      return { error: 'Booking closed. There are no seats available.', statusCode: 400 };
    } else if (isBooked) {
      return { error: 'Previous booking not accepted by creator.', statusCode: 400 };
    } else if (isAlreadyBookedAndPending) {
      await TableBooking.findOne({
        table_id: id,
        user_id: ProfileMemberId(req),
        status: payPending,
      });

      return { error: 'Table already booked. Payemnt is pending.', statusCode: 400 };
    } else if (isAlreadyBookedAndSuccess) {
      return { error: 'Table already booked. You cannot book again.', statusCode: 400 };
    }

    return null; // No error
  };

  const insertData = async () => {
    try {
      // const table = await Tables.findOne({ id });
      const table = await Tables.findOne({
        id: id,
        status: { '!=': UseDataService.listingTableStatusNotEqual }
      });

      if (!table) {
        return { error: 'Table not found', statusCode: 404 };
      }

      const { price, title, created_by } = table;
      const bookingError = await handleTableBooking();

      if (bookingError) {
        return bookingError;
      }

      const amount = price * seats;
      // const amount = price * seats * 100;
      let order;
      try {
        // order = await RazorpayService.createRazorpayOrder(amount, title);
        order = await RazorpayService.createRazorpayOrder({ amount, title, tableId: id, userId: profileId });
      } catch (error) {
        await UseDataService.errorDataCreate({
          table_id: id,
          type: createOrderErr,
          type_glossary: 'createOrderErr',
          booking_id: null,  // Correctly referencing bookingData.id
          booking_details: {},
          user_id: profileId,
          creator_id: created_by,
          error_details: error // Ensure to store error details as a string
        });

        return { statusCode: 500, message: 'Failed to create payment order', error };
      }
      /**
       * Set order Expire Date
       * ExpireDate set to 4 hrs
       */
      
      // const expiryDate = moment().add(expiryMins, 'minutes').toDate(); // Assuming expiry is 5 minutes

      filteredPostData = {
        order_id: order.id,
        table_id: id,
        user_id: profileId,
        seats,
        amount,
        creator_id: created_by,
        status: payPending,
        title
      };

      return { success: true };

    } catch (error) {
      return { error: error, statusCode: 500 };
    }
  };

  const createBooking = async (postData) => {
    const { order_id, table_id, user_id, amount, status, creator_id, status_glossary } = postData;
    ({ postData })
    

    const ids = [];
    if (user_id) ids.push(user_id);
    if (creator_id) ids.push(creator_id);

    if (ids.length > 0) {
      const profiles = await ProfileMembers.find({
        id: { in: ids }
      }).select(['email', 'first_name', 'last_name']);

      if (user_id) user_info = profiles.find(profile => profile.id === user_id);
      if (creator_id) creator_info = profiles.find(profile => profile.id === creator_id);
    }
    
    const table_info = await Tables.findOne({ id: table_id }).select(['title', 'event_date'])

    try {
      const newBooking = await TableBooking.create({
        order_id,
        table_id,
        user_id,
        seats,
        amount,
        status,
        creator_id,
        creator_info,
        user_info,
        table_info,
        status_glossary
      })

      sendResponse(newBooking);
    } catch (error) {
      throw (error);
    }
  };

  const dataInserted = await insertData(null);
  if (dataInserted.success) {
    validateModel.validate(Tables, input_attributes, filteredPostData, async (valid, errors) => {
      if (valid) {
        try {
          const isBooked = await Tables.checkPreviousBookings(id, profileId, bookingConfirmationPendingByCreator);
          if (!isBooked) {
            filteredPostData.status_glossary = "bookingPayPending";
            await createBooking(filteredPostData);
          }
          await UseDataService.countBookedSeats(id, payPending, paymentSuccess);
        } catch (error) {
          throw (error);
        }
      } else {
        responseObject = {
          errors: errors,
          count: errors.length
        };
        return res.badRequest(responseObject);
      }
    });
  } else {
    return res.status(dataInserted.statusCode).json({ error: dataInserted.error });
  }
};