const bookingDataForCreator = require("./Common/bookingDataForCreator.js");
const bookingDataForUser = require("./Common/bookingDataForUser.js");
const cancelBookingIfTableCancelByHost = require("./Common/cancelBookingIfTableCancelByHost.js");
const checkBookingByCurrentUser = require("./Common/checkBookingByCurrentUser.js");
const checkBookingExistForTableAndCurrentUser = require("./Common/checkBookingExistForTableAndCurrentUser.js");
const checkBookingTableCreatedByCurrentUser = require("./Common/checkBookingTableCreatedByCurrentUser.js");
const checkTableCreatedByCurrentUser = require("./Common/checkTableCreatedByCurrentUser.js");
const completedEvent = require("./Common/completedEvent.js");
const countFollowers = require("./Common/countFollowers.js");
const countTablesBooked = require("./Common/countTablesBooked.js");
const countTablesHosted = require("./Common/countTablesHosted.js");
const dateHelper = require("./Common/dateHelper.js");
const dateHelperUtc = require("./Common/dateHelperUtc.js");
const errorDataCreate = require("./Common/errorDataCreate.js");
const followerData = require("./Common/followerData.js");
const { geocodeLocation } = require("./Common/locationUtils.js");
const mapKit = require("./Common/mapKit.js");
const messages = require("./Common/messages.js");
const pendingPaymentByUser = require("./Common/pendingPaymentByUser.js");
const profilePercentile = require("./Common/profilePercentile.js");
const refundRequestTables = require("./Common/refundRequestTables.js");
// const phoneCrypto = require("./Common/phoneCrypto.js");
// const phoneCryptoCopy = require("./Common/phoneCrypto copy.js");
// const phoneCrypto = require("./Common/phoneCrypto.js");
// const { decryptPhone, encryptPhone } = require("./Common/phoneCrypto.js");
// const { decryptPhone, encryptPhone } = require("./Common/phoneEncryption.js");
const removeFromWishlistAfterTableCancel = require("./Common/removeFromWishlistAfterTableCancel.js");
const retrieveInterestsName = require("./Common/retrieveInterestsName.js");
// const tableCreateByAdmin = require("./Common/tableCreateByAdmin.js");
const tableCreateByManager = require("./Common/tableCreateByManager.js");
const tableCreateByMember = require("./Common/tableCreateByMember.js");
const tableListingCriteria = require("./Common/tableListingCriteria.js");
const tableListingCriteriaWithoutLocation = require("./Common/tableListingCriteriaWithoutLocation.js");
const { processSwaggerGeneration } = require("./processSwaggerGenerate.js");
// Payment status
const {
  payPending,
  paymentSuccess,
  eventAttended,
  bookingConfirmationPendingByCreator,
  bookingRejectByCreator,
  bookingCancelledByUser,
  orederExpired,
  refundRequest,
  refundSuccess,
} = sails.config.custom.paymentStatusCode;

const { admin, manager, member } = sails.config.custom.roles;

const { inactive, active } = sails.config.custom.statusCode;

const { byHost, split } = sails.config.custom.statusCode;

const {
  pending,
  approved,
  reject,
  cancelled,
  eventExpired,
  eventCompleted,
  bookmarkTable,
  follower,
  followerUsers,
  deletedAccountTables,
  autoCancelledMinSeatsNotBooked,
  bookingClosed
} = sails.config.custom.tableStatusCode;

const { standard, premium } = sails.config.custom.tableType;

const listingTableStatus = [approved];

const listingTableStatusNotEqual = [
  inactive,
  cancelled,
  reject,
  pending,
  // eventExpired,
  deletedAccountTables,
  autoCancelledMinSeatsNotBooked,
  eventCompleted
];
const {
  razorpayErr,
  createOrderErr,
  paymentErr,
  refundErr
} = sails.config.custom.errorTypeCodes;

/*   errorTypeCodes: {
    razorpayErr: 1,
    createOrderErr: 2,
    paymentErr: 3,
    refundErr: 4
  },
 */
const { tablesVideo, tablesPhoto } = file_path;

const resolution = {
  verySmall: { width: "100%", height: "100%", bitrate: "100k", name: "verySmall", status: false }, // Very small
  small: { width: 320, height: 180, bitrate: "200k", name: "small", status: false }, // Small
  qvga: { width: 426, height: 240, bitrate: "300k", name: "qvga", status: false }, // QVGA
  smallToMedium: { width: 480, height: 270, bitrate: "400k", name: "smallToMedium", status: false }, // Small to medium
  lowResolution: { width: 640, height: 360, bitrate: "500k", name: "lowResolution", status: false }, // Low resolution
  standardResolution: { width: 1920, height: 1080, bitrate: "500k", name: "standardResolution", status: true }, // Standard resolution
  qhd: { width: 960, height: 540, bitrate: "1.2M", name: "qhd", status: false }, // qHD
  hd: { width: 2048, height: 1700, bitrate: "2.5M", name: "hd", status: true }, // HD
  hdPlus: { width: 1440, height: 810, bitrate: "3M", name: "hdPlus", status: false }, // HD+
  fullHd: { width: 1920, height: 1080, bitrate: "5M", name: "fullHd", status: false }, // Full HD
};

const resolutionNames = Object.values(resolution)
  .filter((res) => res.status) // Filter only those where status is true
  .map((res) => res.name); // Extract the name property

module.exports = {

  /***** Status code ********/
  inactive,
  active,

  /*** Roles ***/
  admin,
  manager,
  member,

  /*** Table status code ***/
  pending,
  approved,
  reject,
  cancelled,
  eventExpired,
  eventCompleted,
  bookmarkTable,
  follower,
  followerUsers,
  deletedAccountTables,
  autoCancelledMinSeatsNotBooked,
  bookingClosed,

  /*** Payment status code ***/
  payPending,
  paymentSuccess,
  eventAttended,
  bookingConfirmationPendingByCreator,
  bookingRejectByCreator,
  bookingCancelledByUser,
  orederExpired,
  refundRequest,
  refundSuccess,

  /******* Table Types ********/
  standard,
  premium,

  /******* Table Expenses ********/
  byHost,
  split,

  /******* Error Types ********/

  razorpayErr,
  createOrderErr,
  paymentErr,
  refundErr,


  /* ========================== */

  resolution,
  resolutionNames,
  tablesVideo,
  tablesPhoto,
  listingTableStatus,
  listingTableStatusNotEqual,
  // formatDate: require("./Common/formateDate.js"),
  locationUtils: require("./Common/locationUtils.js"),
  mapKit,

  tableListingCriteria,
  tableListingCriteriaWithoutLocation,
  searchCriteria: require("./Common/searchCriteria.js"),
  initiateRefund: require("./Common/initiateRefund.js"),
  paidBooking: require("./Common/paidBooking.js"),
  updateRecord: require("./Common/updateRecord.js"),
  sendNotification: require("./Common/sendNotification.js"),
  findOneRecord: require("./Common/findOneRecord.js"),
  findRecord: require("./Common/findRecord.js"),
  processMediaData: require("./Common/processMediaData.js"),
  completedEvent,
  pendingPaymentByUser,
  checkTableCreatedByCurrentUser,
  checkBookingByCurrentUser,
  checkBookingTableCreatedByCurrentUser,
  checkBookingExistForTableAndCurrentUser,
  removeFromWishlistAfterTableCancel,
  cancelBookingIfTableCancelByHost,
  // decryptPhone,
  // decryptPhone, // calls multiple times so removed
  // phoneCrypto,
  retrieveInterestsName,
  countTablesBooked,
  countTablesHosted,
  messages,
  dateHelper,
  dateHelperUtc,
  tableCreateByManager,
  tableCreateByMember,
  bookingDataForCreator,
  bookingDataForUser,
  geocodeLocation,
  followerData,
  countFollowers,
  processSwaggerGeneration,
  refundRequestTables,
  errorDataCreate,




  /**
 * Calculates the profile completion percentage based on user data.
 * Returns an object with the following keys:
 *  - percentage: The calculated profile completion percentage.
 *  - updatedProfile: The updated profile data (if applicable).
 *  - missingFields: An array of fields that are missing or incomplete.
 *
 * @param {Object} userData - The user data object containing fields like age, gender, etc.
 * @returns {Object} - An object containing the profile completion percentage, updated profile, and missing fields.
 */
  profilePercentile,


  // tableCreateByAdmin,
  get tableCreateByAdmin() {
    return require("./Common/tableCreateByAdmin.js");
  },

  get phoneCrypto() {
    return require("./Common/phoneCrypto.js")
  },

};