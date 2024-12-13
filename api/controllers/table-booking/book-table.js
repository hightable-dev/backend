module.exports = async function (request, response) {
  const postRequestData = request.body;
  const profileId = ProfileMemberId(request); // Ensure this is implemented correctly
  const { table_id: tableId } = postRequestData;

  const {
    errorMessages,
    listingTableStatusNotEqual,
    payPending,
    paymentSuccess,
    createOrderErr,
  } = UseDataService;

  const inputAttributes = [
    { name: 'table_id', required: true },
  ];

  const payloadAttributes = [
    ...inputAttributes,
    { name: 'order_id', required: true },
    { name: 'table_id', required: true },
    { name: 'user_id', required: true },
    { name: 'seats', required: true },
    { name: 'creator_id', required: true },
    { name: 'table_details', required: true },
    { name: 'user_details', required: true },
    { name: 'creator_details', required: true },
    { name: 'status_glossary' },
  ];

  let filteredPostData = {};

  async function insertFilteredPostData() {
    const keysToPick = payloadAttributes.map((attr) => attr.name);
    filteredPostData = _.pick(postRequestData, keysToPick);

    try {
      const booking = await TableBooking.findOne({ table_id: tableId, user_id: profileId })
        .select(['id', 'table_id', 'status']);

      const tableDetails = await Tables.findOne({ id: tableId, status: { '!=': listingTableStatusNotEqual } })
        .select(['id', 'title', 'price', 'status', 'event_date', 'max_seats', 'booked', 'created_by']);



      if (!tableDetails) {
        throw errorMessages.tableNotFound;
      } else if (tableDetails.booked >= tableDetails.max_seats) {
        throw errorMessages.bookingClosed;
      } else if (parseInt(tableDetails.created_by) === parseInt(profileId)) {
        throw errorMessages.ownTableBooking;
      }

      if (booking) {
        const { status } = booking;

        switch (status) {
          case paymentSuccess:
            throw errorMessages.bookedByUser;

          case payPending:
            throw errorMessages.payPendingByUser;

          default:
            const { id, title } = tableDetails;
            filteredPostData.table_details = {
              id,
              title
            }
            break;
        }
      }
      // Create Razorpay order
      const { price, title, created_by } = tableDetails;
      let order;
      try {

        order = await RazorpayService.createRazorpayOrder({ amount: price, title, tableId, userId: profileId });

      } catch (e) {
        await UseDataService.errorDataCreate({
          table_id: tableId,
          type: createOrderErr,
          type_glossary: 'createOrderErr',
          booking_id: null,
          booking_details: {},
          user_id: profileId,
          creator_id: created_by,
          error_details: e,
          description: e?.error?.description
        });
        throw { status: e.statusCode, message: `Razorpy ${e.error?.description}` }
      }


      try {
        async function fetchProfileInfo(id) {
          if (!id) return null;
          const data = await ProfileMembers.findOne({ id }).select(['email', 'first_name', 'last_name', 'photo', 'phone']);
          if (!data) return null;
          const { email, first_name, last_name, photo } = data;
          return { id, email, first_name, last_name, photo };
        }

        if (created_by) {
          filteredPostData.creator_details = await fetchProfileInfo(created_by);
        }

        if (profileId) {
          filteredPostData.user_details = await fetchProfileInfo(profileId);
        }

      } catch {
        throw ('Error Fetch profiles');

      }


      filteredPostData.table_details = { id: tableId, title };
      // Populate filteredPostData
      filteredPostData = {
        ...filteredPostData,
        seats: 1,
        order_id: order.id,
        table_id: tableId,
        user_id: profileId,
        amount: price,
        creator_id: created_by,
        status: payPending,
        title,
      };

      return filteredPostData;
    } catch (error) {
      throw error;
    }
  }

  try {
    const filteredPostData = await insertFilteredPostData();

    const newData = await UseDataService.dataCreate(request, response, {
      modelName: TableBooking,
      inputAttributes: inputAttributes,
      payloadData: payloadAttributes,
      postData: filteredPostData,

    });

    return newData;
  } catch (error) {
    throw error
  }
};
