const _ = require('lodash');
const DataService = require('../../services/DataService');
const moment = require('moment-timezone');

module.exports = async function list(request, response) {

  const request_query = request.allParams();
  const filtered_query_data = _.pick(request_query, ['id']);
  const { id } = filtered_query_data;
  const { bookingClosed, bookmarkTable, bookingCancelledByUser } = UseDataService;
  const input_attributes = [
    { name: 'id', number: true, min: 1 },
  ];

  let responseObject = {};
  const sendResponse = (item) => {
    responseObject = {
      meta: {
        ...sails.config.custom.s3_bucket_options,
      },
      message: 'Table viewed successfully.',
      details: item, // return single item
    };

    response.ok(responseObject)

    return;
  };

  // Function to build the query criteria for fetching the table
  function buildCriteria() {
    return {
      id,
    };
  }


  // Validate input attributes and proceed if valid
  validateModel.validate(null, input_attributes, filtered_query_data, async function (valid, errors) {
    if (valid) {
      try {
        const criteria = buildCriteria();

        // Fetch table data and populate related entities
        let item = await Tables.findOne(criteria)
          .populate('category')
          .populate('user_profile');

        if (!item) {
          return response.notFound({ message: 'Table not found' });
        }

        if (item?.user_profile?.phone) {
          await phoneEncryptor.decrypt(item?.user_profile?.phone, function (decrypted_text) {
            item.user_profile.phone = decrypted_text;
          });
        }

        item.creator_details = item.user_profile;
        delete item.user_profile;

        // Process the item (media, video, user profile photo)
        if (item.event_date) {
          item.event_date = UseDataService.dateHelper(
            item.event_date,
            "YYYY-MM-DDTHH:mm:ss.SSSZ",
            "DD-MM-YYYY HH:mm"
          );

        }
        item.media = item.media?.length > 0 ? item.media[0] : null;
        item.video = item.video?.length > 0 ? item.video[0] : null;

        // Check if a review exists for the table and user
        const review = await Reviews.findOne({ reviewer_profile_id: ProfileMemberId(request), table_id: id });

        const is_review = !!review;

        if (UserType(request) === roles.member) {
          // Check if the current user is a follower of the creator of the table
          const followerRecord = await Followers.findOne({
            follower_profile_id: ProfileMemberId(request),
            creator_profile_id: parseInt(item.created_by)
          });

          // If follower record found, set is_follower to true, otherwise false
          const bookmarkRecord = await BookMarks.findOne({
            user_id: ProfileMemberId(request),
            table_id: item.id
          });

          // const isBooked = await TableBooking.findOne({
          //   user_id: ProfileMemberId(request),
          //   table_id: item.id,
          //   status: { in: [payPending, bookingConfirmationPendingByCreator] }
          // });

          let isBooked = await TableBooking.find({
            user_id: ProfileMemberId(request),
            table_id: item.id,
            // status: { in: [payPending, bookingConfirmationPendingByCreator, bookingCancelledByUser, paymentSuccess, cancelled, refundRequest, refundSuccess ] }
          })
            .sort('created_at DESC')  // Assuming 'createdAt' exists, sorting by most recent
            .limit(1);  // Limiting the result to just one (latest entry)
          isBooked = isBooked[0];
          console.log("Last Booking Entry:", isBooked);


          const isEventStatusByUser = await EventStatus.findOne({
            user_id: ProfileMemberId(request),
            table_id: item.id
          });

          const is_follower = followerRecord ? followerRecord.status === sails.config.custom.statusCode.follower : false;
          // item.is_follower = is_follower;

          const is_bookmark = bookmarkRecord ? bookmarkRecord.status === bookmarkTable : false;
          const isBookingClosed = item.max_seats <= item.booked;
          //           const now = moment().utcOffset("+05:30").toDate();; // Get the current date and time
          //           // const now = new Date(); // Get the current date and time

          //           // const eventDate = moment(item.event_date, "DD-MM-YYYY HH:mm").toDate(); // Parse event_date correctly
          //           const eventDate = moment(item.event_date, "YYYY-MM-DD HH:mm").utcOffset("+05:30").toDate();
          // console.log("========",{now,eventDate})
          //           item.event_expired = now < eventDate;
          // item.event_expired2 = now > eventDate;

          // Set your timezone
          // const userTimezone = "UTC+5:30"; // UTC+5:30
          let now = new Date();
          let eventDate = item.event_date;
          const reportedHost = await ReportHost.findOne({ user_id: ProfileMemberId(request), table_id: id })
          const reportedTable = await ReportTable.findOne({ user_id: ProfileMemberId(request), table_id: id })

          now = moment(now, "YYYY-MM-DD HH:mm").toDate();
          now = moment.utc(now).tz("Asia/Kolkata").format('YYYY-MM-DD HH:mm:ss');
          now = moment.tz(now, "YYYY-MM-DD HH:mm").toDate();

          eventDate = moment(eventDate, "DD-MM-YYYY HH:mm").toDate();
          eventDate = moment.utc(eventDate).tz("Asia/Kolkata").format('YYYY-MM-DD HH:mm:ss');
          eventDate = moment.tz(eventDate, "DD-MM-YYYY HH:mm").toDate();

          console.log("EVENTSTATUS", { now, eventDate });
          item.event_expired = now > eventDate;
          item.is_bookmark = is_bookmark;
          item.is_review = is_review;
          item.is_booked = isBooked ? true : false;
          // item.event_on =
          // item.is_booked = isBooked?.status ;
          // item.booking_status = isBookingClosed
          //   ? bookingClosed
          //   : isBooked ? isBooked.status : false;
          /* 
            isBooked.status = 11;
            item.order_id = isBooked ?
            isBooked.status !== bookingCancelledByUser ? isBooked.order_id : null : false;
           */
          item.order_id = isBooked?.order_id;

          // item.order_id = isBooked ? isBooked.order_id : null ;
          item.is_event_status_byuser = isEventStatusByUser?.event_done_flag;
          item.is_follower = is_follower;

          item.reportedHost = reportedHost ? true : false;
          item.reportedTable = reportedTable ? true : false;

          const checkBookingStatus = await UseDataService.getBookingStatus(request, tableId = item.id);
          item.booking_status = checkBookingStatus?.tableBookingStatus?.status ?? null;
          item.booking_close = checkBookingStatus?.tableBookingClose;

        }
        sendResponse(item);

        // DataService.completedEvent()

      } catch (error) {
        console.error('Error retrieving service requests:', error);
        return response.serverError('Server Error');
      }
    } else {
      return response.status(400).json({
        errors: errors,
        count: errors.length,
      });
    }
  });
};