/* global _, ProfileManagers /sails */
const moment = require('moment');
require('dotenv').config();

module.exports = async function createOrder(req, res) {
  const { payPending, orederExpired, paymentSuccess, bookingConfirmationPendingByCreator, createOrderErr } = UseDataService;

  const { id } = req.body;
  let responseObject = {};

  const data = ['order_id', 'table_id', 'user_id', 'seats', 'expiry_date', 'expires_at', 'creator_id', 'status_glossary'];
  const profileId = req.user.profile_members;
  const postRequestData = req.body;
  const seats = 1;
  let filteredPostData = _.pick(postRequestData, data);

  let input_attributes = [
    { name: 'order_id', required: true },
    { name: 'table_id', required: true },
    { name: 'user_id', required: true },
    { name: 'seats', required: true },
    { name: 'expiry_date', required: true },
    { name: 'expires_at', required: true },
    { name: 'creator_id', required: true },
    { name: 'status_glossary' },
  ];

  console.log({ ididididi: id })
  const sendResponse = (details) => {
    responseObject = {
      message: 'Table booked .',
      details: _.cloneDeep(details)
    };
    return res.ok(responseObject);
  };

  const handleTableBooking = async () => {
    await Tables.handleExpiredBookings(id, payPending, orederExpired);
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

      return { error: 'Your booking accept. Please pay to confirm.', statusCode: 400 };
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
        console.error('Error creating Razorpay order:', error);
        await UseDataService.errorDataCreate({
          table_id: id,
          type: createOrderErr,
          type_glossary : 'createOrderErr',
          booking_id: null,  // Correctly referencing bookingData.id
          booking_details: {},
          user_id:profileId,
          creator_id:created_by,
          error_details: error // Ensure to store error details as a string
        });

        return { statusCode: 500, message: 'Failed to create payment order', error };
      }
      /**
       * Set order Expire Date
       * ExpireDate set to 4 hrs
       */
      const expiryMins = 14400;
      const expiryDate = moment().add(expiryMins, 'minutes').toDate(); // Assuming expiry is 5 minutes

      filteredPostData = {
        order_id: order.id,
        table_id: id,
        user_id: profileId,
        seats,
        amount,
        creator_id: created_by,
        // status: bookingConfirmationPendingByCreator,
        status: payPending,
        expiry_date: expiryDate,
        expires_at: expiryMins,
        title
      };

      return { success: true };

    } catch (error) {
      console.error('Error inserting data:', error);
      return { error: error, statusCode: 500 };
    }
  };

  const handleError = (error) => {
    responseObject = {
      errors: [{ message: error.message }],
      count: 1
    };
    return res.status(500).json(responseObject);
  };

  const createBooking = async (postData) => {
    const { order_id, table_id, user_id, amount, status, expiry_date, expires_at, creator_id, status_glossary } = postData;


    try {
      const newBooking = await TableBooking.create({
        order_id,
        table_id,
        user_id,
        seats,
        amount,
        status,
        expiry_date,
        expires_at,
        creator_id,
        status_glossary
      })
      // 
      // const msg = await UseDataService.messages({ tableId: table_id, userId: user_id });


      /*   
      This notification removed bcz user directly book and pay
      without accept or reject by host
      
          if (newBooking) {
              await UseDataService.sendNotification({
                notification: {
                  senderId: profileId,
                  type: 'booking',
                  message: msg?.BookingRequestMsg,
                  receiverId: creator_id,
                  followUser: null,
                  tableId: id,
                  payOrderId: filteredPostData.order_id,
                  isPaid: false,
                  templateId: 'bookTable',
                  roomName: 'AcceptBooking_',
                  creatorId: creator_id,
                  status: 1, // approved
                },
      
                pushMessage: {
                  title: title,
                  payOrderId: filteredPostData.order_id
                }
              });
            } */

      sendResponse(newBooking);
    } catch (error) {
      handleError(error);
    }
  };



  const dataInserted = await insertData(null);

  if (dataInserted.success) {
    validateModel.validate(Tables, input_attributes, filteredPostData, async (valid, errors) => {
      if (valid) {
        try {
          const isBooked = await Tables.checkPreviousBookings(id, profileId, bookingConfirmationPendingByCreator);
          if (!isBooked) {
            filteredPostData.status_glossary = "bookingConfirmationPendingByCreator";
            await createBooking(filteredPostData);
          }
          await Tables.updateTableSeats(id, payPending, paymentSuccess);
        } catch (error) {
          return handleError(error);
        }
      } else {
        responseObject = {
          errors: errors,
          count: errors.length
        };
        return res.status(400).json(responseObject);
      }
    });
  } else {
    return res.status(dataInserted.statusCode).json({ error: dataInserted.error });
  }
};