// Payment status
const { 
  payPending, 
  orederExpired, 
  paymentSuccess, 
  bookingConfirmationPendingByCreator, 
  bookingAcceptedByCreator, 
  bookingRejectedByCreator
 } = paymentStatusCode;

// Table status
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
  deletedAccountTables
 } = sails.config.custom.tableStatusCode;

const { 
  inactive
 } = sails.config.custom.statusCode;

const listingTableStatus = [approved];
const listingTableStatusNotEqual = [inactive,cancelled,pending,eventExpired,deletedAccountTables];
const { tablesVideo, tablesPhoto} = file_path;

module.exports = {
  tablesVideo,
  tablesPhoto,
  listingTableStatus,
  listingTableStatusNotEqual,
  searchCriteria : require('./Common/searchCriteria'),
  initiateRefund: require('./Common/initiateRefund'),
  paidBooking: require('./Common/paidBooking'),
  updateRecord: require('./Common/updateRecord'),
  countRecord: require('./Common/countRecord'),
  formatDate: require('./Common/formateDate'),
  sendNotification: require('./Common/sendNotification'),
  findOneRecord: require('./Common/findOneRecord'),
  findRecord: require('./Common/findRecord'),
  createRecord: require('./Common/createRecord'),
  locationUtils: require('./Common/locationUtils'),
};
