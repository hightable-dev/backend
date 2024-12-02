const bookingDataForCreator = require("./data-service/bookingDataForCreator.js");
const bookingDataForUser = require("./data-service/bookingDataForUser.js");
const cancelBookingIfTableCancelByHost = require("./data-service/cancelBookingIfTableCancelByHost.js");
const checkBookingByCurrentUser = require("./data-service/checkBookingByCurrentUser.js");
const checkBookingExistForTableAndCurrentUser = require("./data-service/checkBookingExistForTableAndCurrentUser.js");
const checkBookingTableCreatedByCurrentUser = require("./data-service/checkBookingTableCreatedByCurrentUser.js");
const checkTableCreatedByCurrentUser = require("./data-service/checkTableCreatedByCurrentUser.js");
const completedEvent = require("./data-service/completedEvent.js");
const countFollowers = require("./data-service/countFollowers.js");
const countTablesBooked = require("./data-service/countTablesBooked.js");
const countTablesHosted = require("./data-service/countTablesHosted.js");
const dataCreate = require("./data-service/dataCreate.js");
const dateHelper = require("./data-service/dateHelper.js");
const dateHelperUtc = require("./data-service/dateHelperUtc.js");
const { emailNotification } = require("./data-service/emailService.js");
const errorDataCreate = require("./data-service/errorDataCreate.js");
const followerData = require("./data-service/followerData.js");
const getBookingStatus = require("./data-service/getBookingStatus.js");
const { geocodeLocation } = require("./data-service/locationUtils.js");
const mapKit = require("./data-service/mapKit.js");
const messages = require("./data-service/messages.js");
const pendingPaymentByUser = require("./data-service/pendingPaymentByUser.js");
const profilePercentile = require("./data-service/profilePercentile.js");
const refundRequestTables = require("./data-service/refundRequestTables.js");
// const phoneCrypto = require("./data-service/phoneCrypto.js");
// const phoneCryptoCopy = require("./data-service/phoneCrypto copy.js");
// const phoneCrypto = require("./data-service/phoneCrypto.js");
// const { decryptPhone, encryptPhone } = require("./data-service/phoneCrypto.js");
// const { decryptPhone, encryptPhone } = require("./data-service/phoneEncryption.js");
const removeFromWishlistAfterTableCancel = require("./data-service/removeFromWishlistAfterTableCancel.js");
const retrieveInterestsName = require("./data-service/retrieveInterestsName.js");
// const tableCreateByAdmin = require("./data-service/tableCreateByAdmin.js");
const tableCreateByManager = require("./data-service/tableCreateByManager.js");
const tableCreateByMember = require("./data-service/tableCreateByMember.js");
const tableListingCriteria = require("./data-service/tableListingCriteria.js");
const tableListingCriteriaWithoutLocation = require("./data-service/tableListingCriteriaWithoutLocation.js");
const tableListingCriteriaWithoutLocationPublic = require("./data-service/tableListingCriteriaWithoutLocationPublic.js");
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
  // formatDate: require("./data-service/formateDate.js"),
  locationUtils: require("./data-service/locationUtils.js"),
  mapKit,

  tableListingCriteria,
  tableListingCriteriaWithoutLocation,
  searchCriteria: require("./data-service/searchCriteria.js"),
  initiateRefund: require("./data-service/initiateRefund.js"),
  paidBooking: require("./data-service/paidBooking.js"),
  updateRecord: require("./data-service/updateRecord.js"),
  sendNotification: require("./data-service/sendNotification.js"),
  findOneRecord: require("./data-service/findOneRecord.js"),
  findRecord: require("./data-service/findRecord.js"),
  processMediaData: require("./data-service/processMediaData.js"),
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
  emailNotification,
  dataCreate,
  getBookingStatus,
  tableListingCriteriaWithoutLocationPublic,

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
    return require("./data-service/tableCreateByAdmin.js");
  },

  get phoneCrypto() {
    return require("./data-service/phoneCrypto.js")
  },

};