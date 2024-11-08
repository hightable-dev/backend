const { logdata } = require('data-utils-suite')
const common = require('../services/common');
const DataService = require('./DataService');
const axios = require('axios');

module.exports = {
  DATE_VALIDATIONS: [
    {
      FORMAT: 'DD-MM-YYYY',
      INVALID_FORMAT_MESSAGE: 'Invalid date format. Please provide the date in DD-MM-YYYY format.'
    },
    {
      FORMAT: 'MM/DD/YYYY',
      INVALID_FORMAT_MESSAGE: 'Invalid date format. Please provide the date in MM/DD/YYYY format.'
    }
    // Add more date validations as needed
  ],
  NO_DATA_FOUND_MESSAGE: 'No data found',

  // tableStatus: {
  //   pending : 2 ,
  //   approved : 3,
  //   reject: 4,
  //   bookedfull: 5,
  // },

  // User-related functions
  // msgUserNotFound: "User Not Found",
  UserId: (req) => req.user.id,
  UserType: (req) => req.user.types,
  ProfileAdminId: (req) => req.user.profile_admin ,
  ProfileManagerId: (req) => req.user.profile_managers,
  ProfileMemberId: (req) => req.user.profile_members,
  ProfileAdminOrManagerId: (req) => req.user.profile_admin || req.user.profile_managers,
  DataService: require('./DataService')
  

};

// Exporting user-related functions globally



global.userNotFound = module.exports.userNotFound;
global.UserId = module.exports.UserId;
global.ProfileAdminId = module.exports.ProfileAdminId;
global.ProfileManagerId = module.exports.ProfileManagerId;
global.ProfileMemberId = module.exports.ProfileMemberId;
global.ProfileAdminOrManagerId = module.exports.ProfileAdminOrManagerId;
global.UserType = module.exports.UserType;
global.logdata = logdata;
global.UseDataService =  DataService;
global.axios =  axios;
// global.tableStatusCode = module.exports.tableStatusCode;

