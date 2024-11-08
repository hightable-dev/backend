const DataService = require("../../services/DataService");
const moment = require('moment');

module.exports = async function findOne(request, response) {

  const { payPending, orderExpired, paymentSuccess } = paymentStatusCode;
  const { pending, approved, rejected, bookingClosed, bookmarkTable, eventExpired } = tableStatusCode;
  const { tablesVideo, tablesPhoto} = file_path;
              

  try {
    var _response_object = {};
    // Extract ID from request parameters
    const { id } = request.query;

    // if any booking status is 5 and expired will update
    const expiredBookings = await TableBooking.find({
      where: { table_id: id, status: payPending, expiry_date: { '<': new Date() } }
    });

    // Update status of expired bookings to 6
    for (const booking of expiredBookings) {
      await TableBooking.updateOne({ id: booking.id }).set({ status: orderExpired });
    }

    // Find item by ID
    const specificTable = await Tables.find({ id }).limit(1);

    // Check if table exists
    if (!specificTable || specificTable.length === 0) {
      return response.status(404).json({ error: [] });
    }

    let item = specificTable[0];
    const { lat, lng } = item.location;

    item.location_details = await DataService.locationUtils.extractLocationDetails(
      {
        x : lat,
        y : lng
      }
    );
    const currentDate = moment();
    const eventDate = moment(item.event_date, "DD-MM-YYYY HH:mm");
    if (eventDate.isBefore(currentDate) && item.status === approved ) {
      // Event date is expired, update status to 7 in the database
      Tables.updateOne({ id: item.id }, { status: eventExpired }, (err, result) => {
        if (err) {
          console.error("Error occurred while updating table status:", err);
          return response.serverError({ error: "Error occurred while updating table status" });
        } else {
          // Send response after updating table status
          _response_object = { message: "Table Event date is expired" };
          return response.ok(_response_object);
        }
      });
    } else {


    item.media =  item.media ? tablesPhoto + item.media : null;
    item.video = item.video ? tablesVideo + item.video : null;

      item.event_date = DataService.formatDate.ddmmyyyy_hhmm(item.event_date);
    if (!item.media && !item.video) {
      // Set default media path if both are undefined
      item.media = tablesPhoto + 'tables-media-1.png';
    }

    

       // Get creator details
    const creatorDetails = await ProfileMembers.findOne({ id: parseInt(item.created_by) });
    if (creatorDetails?.phone) {
      await phoneEncryptor.decrypt(creatorDetails.phone, function (decrypted_text) {
        creatorDetails.phone = decrypted_text;
      });
    }


    if (!creatorDetails) {
      return response.status(404).json({ error: 'Creator details not found' });
    }

    const category = await Interests.findOne({ id: parseInt(item.category) });

    if (category && category.name) {
      item.category = category.name;
    } else {
      item.category = [];
    }
    const totalReviewsCount = await Reviews.count({ creator_profile_id: parseInt(item.created_by) });

    // Total Tables Count created by user
    const totalTablesCount = await Tables.count({ created_by: parseInt(item.created_by) });
    item.CreaterTableCount = totalTablesCount; // requested by frontend

    // Add creator details to item
    item.creator_details = {
      tableCount: totalTablesCount,
      reviewsCount: totalReviewsCount,
      phone: creatorDetails.phone,
      photo: sails.config.custom.filePath.members + creatorDetails.photo,
    };

    // Check if a review exists for the table and user
    const review = await Reviews.findOne({ reviewer_profile_id: ProfileMemberId(request), table_id: id });

    // If review not found, set is_review to false
    // For commit changes  only
    const is_review = !!review;

    // Check if the current user is a follower of the creator of the table
    const followerRecord = await Followers.findOne({
      follower_profile_id: ProfileMemberId(request),
      creator_profile_id: parseInt(item.created_by)
    });

    // If follower record found, set is_follower to true, otherwise false
    const is_follower = followerRecord ? followerRecord.status === sails.config.custom.statusCode.follower : false;
    const bookmarkRecord = await Bookmarks.findOne({
      user_id: ProfileMemberId(request),
      table_id: item.id
    });
    // If follower record found, set is_follower to true, otherwise false
    const is_bookmark = bookmarkRecord ? bookmarkRecord.status === bookmarkTable : false;

    function generateRandomSixDigit() {
      let randomSixDigit = '';
      for (let i = 0; i < 6; i++) {
          randomSixDigit += Math.floor(Math.random() * 10);
      }
      return randomSixDigit;
  }
    // Send response
    item.randomDigit = generateRandomSixDigit();
    console.log('generateRandomSixDigit', item.randomDigit)
    _response_object = {
      message: 'item retrieved successfully.',
      is_review: is_review,
      is_follower: is_follower,
      is_bookmark: is_bookmark,
      data: item,
    };

    return response.ok(_response_object);
  }
  } catch (error) {
    console.error("Error occurred while fetching item:", error);
    return response.status(500).json({ error: "Error occurred while fetching item" });
  }


};
