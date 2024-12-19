module.exports = {

  badRequest: 400,
  unAuthorized: 401,
  forBidden: 403,
  notFound: 404,
  serverError: 500,
  invalidRole: {
    'status': 'error',
    'message': 'Invalid roles.',
  },
  invalidUser: {
    'status': 'error',
    'message': 'Invalid user.',
  },
  invalidInput: {
    'status': 'error',
    'message': 'Invalid input parameters.',
  },
  noItemsFound: {
    'status': 'error',
    'message': 'No items found.',
  },
  reference: {
    'status': 'error',
    'message': 'Undefined function or variable.',
  },
  internal: {
    'status': 'error',
    'message': 'Internal server error.',
  },
  unexpected: {
    'status': 'error',
    'message': 'Unexpected error occurred.',
  },
  fetchInterests: {
    'status': 'error',
    'message': 'Error fetching Interests list.',
  },
  fetchTags: {
    'status': 'error',
    'message': 'Error fetching Tags list.',
  },
  createTables: {
    'status': 'error',
    'message': 'Error creating table.',
  },

  fetchTables: {
    'status': 'error',
    'message': 'Error fetching Tables list.',
  },
  notFoundNotification: {
    'status': 'error',
    'message': 'No notification found.',
  },
  bookedByUser: {
    status: 409,
    'message': 'You already booked,',
  },
  payPendingByUser: {
    'status': 409,
    'message': 'Previous order payment is pending',
  },

  /* Table Bookings */
  bookingWait: {
    'status': 410,
    'message': 'Bookings are in the queue. Please try again later.'
  },
  bookingClosed: {
    'status': 410,
    'message': 'Booking closed for this table.'
  },
  ownTableBooking: {
    'status': 400,
    'message': 'You cannot book your table.'
  },

  /* Tables error */
  tableNotFound: {
    'status': 404,
    'message': 'Table not found.'
  },

  /* Service Error */
  failedOrderCreate: {
    'status': 400,
    'message': 'Invalid request. Unable to create the Razorpay order.'
  }


};
