/* global _, ProfileManagers /sails */
const moment = require('moment');
const DataService = require('../../services/DataService');
require('dotenv').config();

module.exports = async function createOrder(req, res) {

  const { payPending, orederExpired, paymentSuccess, bookingConfirmationPendingByCreator, bookingAcceptedByCreator, bookingRejectedByCreator } = paymentStatusCode;

  const { id } = req.body;
  const data = ['order_id', 'table_id', 'user_id', 'seats', 'expiry_date', 'expires_at', 'creator_id'];

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
  ];

  const sendResponse = (details) => {
    const responseObject = {
      message: 'Table booked .',
      details: _.cloneDeep(details)
    };
    return res.ok(responseObject);
  };

  const handleTableBooking = async (table) => {
    const { max_seats, booked_seats, expires_at } = table;

    await Tables.handleExpiredBookings(id, payPending, orederExpired);
    await Tables.checkAvailableSeats(id, seats, max_seats, booked_seats, payPending, paymentSuccess);

    const isAlreadyBookedAndPending = await Tables.checkPreviousBookings(id, profileId, payPending);
    const isAlreadyBookedAndSuccess = await Tables.checkPreviousBookings(id, profileId, paymentSuccess);
    const isBooked = await Tables.checkPreviousBookings(id, profileId, bookingConfirmationPendingByCreator);

    if (isBooked) {
      return { error: 'Previous booking not accepted by creator.', statusCode: 400 };
    } else if (isAlreadyBookedAndPending) {
      const expireBooking = await TableBooking.findOne({
        table_id: id,
        user_id: ProfileMemberId(req),
        status: payPending,
      });

      const now = new Date();
      const expiryDate = new Date(expireBooking.expiry_date);
      const remainingTime = expiryDate - now;

      const formatRemainingTime = (milliseconds) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      };

      const remainingTimeFormatted = formatRemainingTime(remainingTime);

      return { error: `Your booking accept. Please pay to confirm. Your order will expire in ${remainingTimeFormatted}`, statusCode: 400 };
    } else if (isAlreadyBookedAndSuccess) {
      return { error: 'Table already booked. You cannot book again.', statusCode: 400 };
    }

    return null; // No error
  };

  const insertData = async (data) => {
    try {
      // const table = await Tables.findOne({ id });
      console.log('DataService.listingTableStatusNotEqual', DataService.listingTableStatusNotEqual)
      const table = await DataService.findOneRecord({
        modelName: "Tables",
        criteria: {
          id: id,
          status: { '!=': DataService.listingTableStatusNotEqual }
        }
      });

      if (!table) {
        return { error: 'Table not found', statusCode: 404 };
      }

      const { price, title, created_by, max_seats, booked_seats, expires_at } = table;
      const bookingError = await handleTableBooking(table);

      if (bookingError) {
        return bookingError;
      }

      const amount = price * seats;
      let order;
      try {
        order = await RazorpayService.createRazorpayOrder(amount, title);
      } catch (error) {
        console.error('Error creating Razorpay order:', error);
        return { error: 'Failed to create payment order', statusCode: 500 };
      }

      const expiryMins = 100;
      const expiryDate = moment().add(expiryMins, 'minutes').toDate(); // Assuming expiry is 5 minutes

      filteredPostData = {
        order_id: order.id,
        table_id: id,
        user_id: profileId,
        seats,
        amount,
        creator_id: created_by,
        status: bookingConfirmationPendingByCreator,
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

  const createBooking = async (postData) => {
    const { order_id, table_id, user_id, seats, amount, status, expiry_date, expires_at, creator_id, title } = postData;
    try {
      const newBooking = await DataService.createRecord({
        modelName: 'TableBooking',
        values: {
          order_id,
          table_id,
          user_id,
          seats,
          amount,
          status,
          expiry_date,
          expires_at,
          creator_id
        }
      })

      if (newBooking) {
        await notificationService({
          senderId: profileId,
          type: 'booking',
          message: `Congratulations! new booking request for the '${title}'. Tap here to confirm booking .`,
          receiverId: creator_id,
          followUser: null,
          tableId: id,
          payOrderId: filteredPostData.order_id,
          isPaid: false,
          templateId: 'bookTable',
          roomName: 'AcceptBooking_',
          creatorId: creator_id,
          status: 1, // approval pending
          pushMsgTitle: title,    // Title, Name ...
          pushMessage: `Congratulations! new booking request for the '${title}'.`
        });
      }

      sendResponse(newBooking);
    } catch (error) {
      handleError(error);
    }
  };

  const handleError = (error) => {
    const responseObject = {
      errors: [{ message: error.message }],
      count: 1
    };
    return res.status(500).json(responseObject);
  };

  const dataInserted = await insertData(null);

  if (dataInserted.success) {
    validateModel.validate(Tables, input_attributes, filteredPostData, async (valid, errors) => {
      if (valid) {
        try {
          const isBooked = await Tables.checkPreviousBookings(id, profileId, bookingConfirmationPendingByCreator);
          if (!isBooked) {
            await createBooking(filteredPostData);
          }
          await Tables.updateTableSeats(id, payPending, paymentSuccess);
        } catch (error) {
          return handleError(error);
        }
      } else {
        const responseObject = {
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
