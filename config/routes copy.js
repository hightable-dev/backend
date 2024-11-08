// /**
//  * Route Mappings
//  * (sails.config.routes)
//  *
//  * Your routes tell Sails what to do each time it receives a request.
//  *
//  * For more information on configuring custom routes, check out:
//  * https://sailsjs.com/anatomy/config/routes-js
//  */

// (passport = require("passport")),
//   (login = require("connect-ensure-login")),
//   (bcrypt = require("bcryptjs")),
//   (trustedClientPolicy = require("../api/policies/isTrustedClient.js")),
//   (loginSocialService = require("../api/services/loginSocialService.js")),
//   (oauth2_server = require("./oauth2.js").server);
// const swaggerDocs = require('../swagger/docs/index.js')


// module.exports.routes = {
//   /**************************** Linkedin ***************************/
//   'GET /all-status-codes': { action: 'allStausCodes/index', swagger : swaggerDocs.allStatusCodesSwagger },

//   'GET /auth/linkedin': 'LinkedInController.linkedin',
//   'GET /auth/linkedin/callback': 'LinkedInController.linkedinCallback',
//   'POST /auth/linkedin/callback': 'LinkedInController.linkedinCallback',
//   // 'GET /auth/linkedin-callback': 'LinkedInController.linkedinCallback',CutmQ6vxQ6tYF9ZyXsGW29iXlYpV95t1mosWJqhNGcKhp8ufoJsqAi6lTqNWBfJa91o2kpwTDFTLRAg3gQSiykX58gKyUT3eGg388P8VI6ZwOYG7QIl2SUdINI1IMo6WRnRKAzbZZMimHouEPiPQAP9TUuKXa8PLL7V674gpsXhaI9KrCnLpFegZwTvLyKtd4cdiQsq3s26Y68UzlYdhHx84G2vSb9WosFKktWc7cbR01B0sEKAhrcPkKdmK7jB
//   // 'GET /send-sms': 'SmsController.sendSMS',
//   // 'POST /send-sms': 'SmsController.sendSMS',
//   // 'POST /send-sms-v2': 'SmsControllerV2.sendMessage', // not work
//   // 'GET /send-sms-v2': 'SmsControllerV2.sendMessage', // not work

//   /**************************** Login & Users Starts Here ***************************/
//   /*Get Access Token Using Password*/
//   "POST /oauth/token": [
//     trustedClientPolicy,
//     passport.authenticate(["basic", "oauth2-client-password"], {
//       session: false,
//     }),
//     oauth2_server.token(),
//     oauth2_server.errorHandler(),

//   ],
//   'POST /users/login-otp': {
//     action: 'users/login-otp', swagger: swaggerDocs.usersLoginOtpSwagger,
//   },

//   /*Get Access Token Using Social Login*/
//   "POST /oauth/social-login": [
//     function (req, res, next) {
//       passport.authenticate(
//         ["basic", "oauth2-client-password"],
//         { session: false },
//         function (error, client) {
//           if (!client) {
//             return res.status(401).json({ message: "Unauthorized" });
//           } else {
//             req.user = client;
//             next();
//           }
//         }
//       )(req, res, next);
//     },
//     loginSocialService,
//   ],

//   "GET /test": function (request, response) {
//     response.status(200).json({ message: "Welcome to Test API.", request: request });
//   },
//   /***************************** Login & Users Ends Here ****************************/
//   "/": function (request, response) {
//     response.status(200).json({ message: "Welcome to Test API." });
//   },

//   "/logged-successful": function (request, response) {
//     response.status(200).json({ message: `logged-successful` });
//   },

//   'GET /test': function (request, response) {
//     response.status(200).json({ message: "Welcome to Test API.", request: request });
//   },
//   /*=====================    Manager    ===================*/
//   'POST /manager/create': { action: 'manager/create' },
//   'PUT /manager/activate': { action: 'manager/activate' },
//   'PUT /manager/update': { action: 'manager/update' },
//   'POST /manager/photo-upload': { action: 'manager/photo-upload' },
//   'GET /manager/view': { action: 'manager/view' },
//   'GET /manager/list': { action: 'manager/list' },

//   /*=================   Tags   =================*/
//   'GET /tags/list': { action: 'tags/list', swagger: swaggerDocs.tagsListSwagger },

//   /*=================   Intrest   =================*/
//   'GET /interests/list': { action: 'interests/list', swagger: swaggerDocs.interestsListSwagger },
//   'GET /interests/category-available': { action: 'interests/category-available', swagger: swaggerDocs.interestsListSwagger },
//   'GET /interests/users-interests-list': { action: 'interests/users-interests-list', swagger: swaggerDocs.interestsUsersListSwagger },
//   "POST /interests/image-upload": { action: "interests/image-upload", swagger: swaggerDocs.interestsImageUploadSwagger },

//   /*=====================    Standard Table   ===================*/
//   'POST /standard-table/set-price': { action: 'standard-table/set-price', swagger : swaggerDocs.standardTableSetPriceSwagger },
//   'GET /standard-table/view-price': { action: 'standard-table/view-price', swagger : swaggerDocs.standardTableViewPriceSwagger },

//   /*=====================    Create table    ===================*/
//   'POST /tables/create': { action: 'tables/create', swagger: swaggerDocs.tablesCreateSwagger },
//   'POST /tables/create-by-admin': { action: 'tables/create-by-admin', swagger:swaggerDocs.tablesCreateByAdminSwagger },
//   'POST /tables/table-status': { action: 'tables/table-status', swagger: swaggerDocs.tablesTableStatusSwagger },
//   'PUT /tables/cancel-table': { action: 'tables/cancel-table', swagger:swaggerDocs.tablesCancelTableSwagger },
//   'GET /tables/list': { action: 'tables/list', swagger: swaggerDocs.tablesListSwagger },
//   'GET /tables/list-admin': { action: 'tables/list-admin', swagger: swaggerDocs.tablesListAdminSwagger },
//   // 'GET /tables/list-by-members-cateogry': { action: 'tables/list-by-members-cateogry' },
//   'GET /tables/my-list': { action: 'tables/my-list', swagger: swaggerDocs.tablesMyListSwagger }, 
//   'POST /tables/table-search': { action: 'tables/table-search', swagger: swaggerDocs.tablesTableSearchSwagger },
//   // 'GET /tables/my-tables-list': { action: 'tables/my-tables-list' }, // lists of tables 
//   // 'GET /tables/my-tables-booked': { action: 'tables/my-tables-booked' }, // lists specific table booking
//   'GET /tables/approved-list': { action: 'tables/approved-list' },
//   'GET /tables/pending-list': { action: 'tables/pending-list' },
//   'GET /tables/high-booked': { action: 'tables/high-booked', swagger: swaggerDocs.tablesHighBookedSwagger },
//   // 'PUT /tables/approve-table': { action: 'tables/approve-table' }, //approve-table changed to table-status
//   'GET /tables/view': { action: 'tables/view', swagger: swaggerDocs.tablesViewSwagger },
//   'GET /tables/view-web': { action: 'tables/view-web' },
//   'PUT /tables/update': { action: 'tables/update' },
//   // "POST /tables/photo-upload": { action: "tables/photo-upload" },
//   "POST /tables/media-upload": { action: "tables/media-upload", swagger: swaggerDocs.tablesMediaUploadSwagger },
//   "POST /tables/video-upload": { action: "tables/video-upload", swagger: swaggerDocs.tablesVideoUploadSwagger },

//   "PUT /tables/event-status-host": { action: "tables/event-status-host", swagger: swaggerDocs.tablesEventStatusHostSwagger },
//   "PUT /tables/event-status-user": { action: "tables/event-status-user", swagger: swaggerDocs.tablesEventStatusUserSwagger },

//   /*=====================    Booking table table    ===================*/
//   'POST /table-booking/book-table': { action: 'table-booking/book-table', swagger: swaggerDocs.tableBookingBookTableSwagger },
//   'GET /table-booking/list': { action: 'table-booking/list' },
//   'GET /table-booking/list-admin': { action: 'table-booking/list-admin' },
//   'GET /table-booking/booked-list-all': { action: 'table-booking/booked-list-all' },
//   'GET /table-booking/booked-my-tables-user-list': { action: 'table-booking/booked-my-tables-user-list' },
//   'GET /table-booking/booked-all-my-list': { action: 'table-booking/booked-all-my-list'},
//   'GET /table-booking/booked-my-tables': { action: 'table-booking/booked-my-tables' },  
//   'POST /table-booking/capture-payment': { action: 'table-booking/capture-payment' },
//   'POST /table-booking/refund-payment': { action: 'table-booking/refund-payment' },
//   'PUT /table-booking/refund': { action: 'table-booking/refund' },
//   'post /table-booking/payout-host': { action: 'table-booking/payout-host' },
//   'GET /table-booking/accept-booking': { action: 'table-booking/accept-booking' },

//   /*=====================    Reviews / Ratings   =====================*/
//   'POST /reviews/give-feedback': { action: 'reviews/give-feedback', swagger : swaggerDocs.reviewsGiveFeedbackSwagger },

//   /*=====================    Wishlist / Bookmarks   =====================*/
//   'POST /bookmark/create': { action: 'bookmark/create', swagger: swaggerDocs.bookmarkCreateSwagger },
//   'GET /bookmark/list': { action: 'bookmark/list', swagger: swaggerDocs.bookmarkListSwagger },

//   /*===================== Follower  =====================*/
//   'POST /followers/create': { action: 'followers/create', swagger : swaggerDocs.followersCreateSwagger },

//   /*===================== Profile Members / Users / Creator =====================*/
//   'POST /profile-members/create': { action: 'profile-members/create' },
//   "GET /profile-members/list": { action: "profile-members/list" },
//   'GET /profile-members/profile': { action: 'profile-members/profile' },
//   'GET /profile-members/view': { action: 'profile-members/view' },
//   'GET /profile-members/view-admin': { action: 'profile-members/view-admin' },
//   'PUT /profile-members/activate': { action: 'profile-members/activate' },
//   'PUT /profile-members/update': { action: 'profile-members/update' },
//   'POST /profile-members/photo-upload': { action: 'profile-members/photo-upload' },


//   "POST /users/notification": { action: "users/notification", },
//   "POST /users/notification-status": { action: "users/notification-status", },

//   "GET /users/linkedinlogin": { action: "users/linkedinlogin", },
//   "PUT /users/update": { action: "users/update" },

//   /*=====================    Payout host   =====================*/
//   'GET /payout-host/list': { action: 'payout-host/list' },
//   'GET /payout-host/view': { action: 'payout-host/view' },
//   'POST /payout-host/payment-to-host': { action: 'payout-host/payment-to-host' },

//   /*=====================    Razorpay  =====================*/
//   'POST /razorpay/capture-transfer': { action: 'razorpay/capture-transfer' },
//   'POST /razorpay/create-account': { action: 'razorpay/create-account' },
  
//   'get /booking/screen': function (req, res) {
//     let request_query = req.allParams();
//     let redirect_url = `hightable://BookingOrder?id=${request_query.id}&createdby=${request_query?.createdby}`;
//     res.redirect(redirect_url);
//   },




//   /****** Removed Apis ****** 
//     "GET /users/view": { action: "users/view", },
//     "GET /users/user-view": { action: "users/user-view", },
//     "GET /users/list": { action: "users/list", },
//     "PUT /users/update": { action: "users/update" },
//     "POST /users/create": { action: "users/create" },
//     "POST /users/photo-upload": { action: "users/photo-upload" },
//   'GET /linkedin/profile': 'LinkedInController.fetchLinkedInProfile',
//   'POST /linkedin/profile': 'LinkedInController.fetchLinkedInProfile',
//   'get /login/linkedin': 'AuthController.linkedin',
//   'get /login/linkedin/callback': 'AuthController.linkedinCallback',
//   'GET /table-booking/pay-order/:id': { action: 'table-booking/pay-order' },

//   */

//   /*=====================    Payments   =====================*/
//   // 'post /payments/create-order': { action: 'payments/create-order' },
//   // 'post /payments/capture-payment': { action: 'payments/capture-payment' },
//   // 'GET /payments/orders': { action: 'payments/all-orders' },
// }