/**Dont remove swaggerDocs**/
const { emailNotification } = require('../api/services/data-service/emailService.js');
const swaggerDocs = require('../swagger/docs/index.js');

/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

(passport = require('passport'));
(login = require('connect-ensure-login'));
(bcrypt = require('bcryptjs'));
(trustedClientPolicy = require('../api/policies/isTrustedClient.js'));
(loginSocialService = require('../api/services/loginSocialService.js'));
(oauth2_server = require('./oauth2.js').server);
module.exports.routes = {
  // Route to initiate LinkedIn OAuth login
  'GET /auth/linkedin': 'LinkedInController.linkedin',

  // Callback route that LinkedIn redirects to after successful login
  'GET /auth/linkedin/callback': 'LinkedInController.linkedinCallback',

  // Route to fetch LinkedIn profile data (could be a POST request depending on your setup)
  'POST /auth/linkedin/profile': 'LinkedInController.fetchLinkedInProfile',
  'GET /fb-connect': 'FbController.fbConnect',
  'GET /linkedin-connect': 'LinkedInController.linkedin',

  /*====================== Login & Users Ends Here ======================*/
  '/': function (request, response) {
    response.status(200).json({ message: 'Welcome to Test API.' });
  },

  '/logged-successful': function (request, response) {
    response.status(200).json({ message: 'logged-successful' });
  },

  /*=====================    Manager    ===================*/
  'POST /manager/create': { action: 'manager/create' },
  'POST /manager/photo-upload': { action: 'manager/photo-upload' },
  'PUT /manager/activate': { action: 'manager/activate' },
  'PUT /manager/update': { action: 'manager/update' },
  'GET /manager/view': { action: 'manager/view' },
  'GET /manager/list': { action: 'manager/list', swagger: swaggerDocs?.managerlistSwagger },

  /*=================   Tags   =================*/
  'GET /tags/list': { action: 'tags/list' },

  /*=================   Intrest   =================*/
  'POST /interests/create': { action: 'interests/create' },
  'POST /interests/image-upload': { action: 'interests/image-upload' },
  'GET /interests/list': { action: 'interests/list', swagger: swaggerDocs?.interestslistSwagger },
  'GET /interests/category-available': { action: 'interests/category-available' },
  'GET /interests/users-interests-list': { action: 'interests/users-interests-list' },

  /*=====================    Standard Table   ===================*/
  'POST /standard-table/set-price': { action: 'standard-table/set-price' },
  'GET /standard-table/view-price': { action: 'standard-table/view-price' },

  /*=====================    Create table    ===================*/

  'GET /tables/list': { action: 'tables/list', swagger: swaggerDocs?.tableslistSwagger },
  'GET /tables/my-list': { action: 'tables/my-list', swagger: swaggerDocs?.tablesmylistSwagger },
  'GET /tables/high-booked': { action: 'tables/high-booked', swagger: swaggerDocs?.tableshighbookedSwagger },
  'GET /tables/view': { action: 'tables/view', swagger: swaggerDocs?.tablesviewSwagger },
  'GET /tables/view-web': { action: 'tables/view-web' },
  'POST /tables/table-search': { action: 'tables/table-search', swagger: swaggerDocs?.tablestablesearchSwagger },
  'POST /tables/media-upload': { action: 'tables/media-upload' },
  'POST /tables/video-upload': { action: 'tables/video-upload' },
  'POST /tables/create': { action: 'tables/create', swagger: swaggerDocs?.tablescreateSwagger },
  'POST /tables/table-status': { action: 'tables/table-status' },
  'PUT /tables/event-status-host': { action: 'tables/event-status-host', },
  'PUT /tables/event-status-user': { action: 'tables/event-status-user', },
  'PUT /tables/cancel-table': { action: 'tables/cancel-table', swagger: swaggerDocs?.tablescanceltableSwagger },
  'PUT /tables/update': { action: 'tables/update' },
  'GET /tables/list-feature-table-public': { action: 'tables/list-feature-table-public' , swagger: swaggerDocs?.tableslistfeaturetablepublicSwagger },
  'GET /tables/list-public': { action: 'tables/list-public', swagger: swaggerDocs?.tableslistpublicSwagger },

  

  /*=====================    Booking table table    ===================*/
  'GET /error-detail/list': { action: 'error-detail/list' },

  /*=====================    Booking table table    ===================*/
  'GET /table-booking/list': { action: 'table-booking/list' },
  'GET /table-booking/booked-list-all': { action: 'table-booking/booked-list-all' },
  'GET /table-booking/booked-my-tables-user-list': { action: 'table-booking/booked-my-tables-user-list' },
  'GET /table-booking/accept-booking': { action: 'table-booking/accept-booking' },
  'GET /table-booking/booked-all-my-list': { action: 'table-booking/booked-all-my-list' },
  'GET /table-booking/booked-my-tables': { action: 'table-booking/booked-my-tables' },
  'POST /table-booking/book-table': { action: 'table-booking/book-table', },
  'POST /table-booking/capture-payment': { action: 'table-booking/capture-payment' },
  'POST /table-booking/refund-payment': { action: 'table-booking/refund-payment' },
  'POST /table-booking/cancel-booking': { action: 'table-booking/cancel-booking' },

  /*=====================    Reviews / Ratings   =====================*/
  'POST /reviews/give-feedback': { action: 'reviews/give-feedback', swagger: swaggerDocs?.reviewsgivefeedbackSwagger },

  /*=====================    Wishlist / Bookmarks   =====================*/
  'POST /bookmark/create': { action: 'bookmark/create' },
  'GET /bookmark/list': { action: 'bookmark/list', swagger: swaggerDocs?.bookmarklistSwagger },

  /*===================== Follower  =====================*/
  'POST /followers/create': { action: 'followers/create' },

  /*===================== Profile Members / Users / Creator =====================*/
  'GET /profile-members/list': { action: 'profile-members/list' },
  'GET /profile-members/profile': { action: 'profile-members/profile' },
  'GET /profile-members/view': { action: 'profile-members/view' },
  'PUT /profile-members/activate': { action: 'profile-members/activate' },
  'PUT /profile-members/update': { action: 'profile-members/update' },
  'POST /profile-members/photo-upload': { action: 'profile-members/photo-upload' },
  'POST /profile-members/create': { action: 'profile-members/create' },
  'DELETE /profile-members/destroy-user': { action: 'profile-members/destroy-user' },

  'POST /users/notification': { action: 'users/notification' },
  'POST /users/notification-status': { action: 'users/notification-status' },
  'PUT /users/update': { action: 'users/update' },

  /*=====================Reports =====================*/
  'POST /report/create-host': { action: 'report/create-host' },
  'POST /report/create-table': { action: 'report/create-table' },

  /****Table booking view not used anywher this api justmaking payment for testing hightable payment***** */
  'GET /testpayment': function (request, response) {
    return response.sendFile('testpayment.html', { root: './assets' });
  },
  'GET /table-booking/view': { action: 'table-booking/view' },
  'POST /testpayment/capture': { action: 'table-booking/test-capture-payment' },

  /**************************** Linkedin ***************************/
  'GET /status-codes': { action: 'allStausCodes/index' },
  'POST /test-email-service': async function (req, res) {
    try {
      const result = await emailNotification(req.body); // Pass request data if needed
      console.log("routeResul", { result })
      return res.status(200).json({ message: result });
    } catch (err) {
      return res.serverError(err);
    }
  },

  /**************************** Login & Users Starts Here ***************************/
  /*Get Access Token Using Password*/
  'POST /oauth/token': [
    trustedClientPolicy,
    passport.authenticate(['basic', 'oauth2-client-password'], {
      session: false,
    }),
    oauth2_server.token(),
    oauth2_server.errorHandler(),
  ],
  'POST /users/login-otp': {
    action: 'users/login-otp',
  },

  /*Get Access Token Using Social Login*/
  'POST /oauth/social-login': [
    function (req, res, next) {
      passport.authenticate(
        ['basic', 'oauth2-client-password'],
        { session: false },
        function (error, client) {
          if (!client) {
            return res.status(401).json({ message: 'Unauthorized' });
          } else {
            req.user = client;
            next();
          }
        }
      )(req, res, next);
    },
    loginSocialService,
  ],

  /*==========================================*/
  'get /booking/screen': function (req, res) {
    let request_query = req.allParams();
    let redirect_url = `hightable://BookingOrder?id=${request_query.id}&createdby=${request_query?.createdby}`;
    res.redirect(redirect_url);
  },

  'get /booking/screen/redirect': function (req, res) {
    let request_query = req.allParams();
    let redirect_url = `hightable://BookingOrder?id=${request_query.id}&createdby=${request_query?.createdby}`;

    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Redirecting...</title>
        <script type='text/javascript'>
          setTimeout(function() {
            window.location.href = '${redirect_url}';
          }, 100);
        </script>
      </head>
      <body>
        <p>Redirecting to the app...</p>
      </body>
      </html>
    `);
  }
}

/****** Removed Apis ******
 
  'GET /users/linkedinlogin': { action: 'users/linkedinlogin' },
 
  'GET /table-booking/list-admin': { action: 'table-booking/list-admin' },
  'GET /profile-members/view-admin': { action: 'profile-members/view-admin' },
 
  'POST /razorpay/create-account': { action: 'razorpay/create-account' },

  'GET /payout-host/list': { action: 'payout-host/list' },
  'GET /payout-host/view': { action: 'payout-host/view' },

  'GET /users/view': { action: 'users/view', },
  'GET /users/user-view': { action: 'users/user-view', },
  'GET /users/list': { action: 'users/list', },
  'PUT /users/update': { action: 'users/update' },
  'POST /users/create': { action: 'users/create' },
  'POST /users/photo-upload': { action: 'users/photo-upload' },
  'GET /linkedin/profile': 'LinkedInController.fetchLinkedInProfile',
  'POST /linkedin/profile': 'LinkedInController.fetchLinkedInProfile',
  'get /login/linkedin': 'AuthController.linkedin',
  'get /login/linkedin/callback': 'AuthController.linkedinCallback',
  'GET /table-booking/pay-order/:id': { action: 'table-booking/pay-order' },

  'post /payments/create-order': { action: 'payments/create-order' },
  'post /payments/capture-payment': { action: 'payments/capture-payment' },
  'GET /payments/orders': { action: 'payments/all-orders' },

  'POST /razorpay/capture-transfer': { action: 'razorpay/capture-transfer' },
  'POST /payout-host/payment-to-host': { action: 'payout-host/payment-to-host' },
  'PUT /table-booking/refund': { action: 'table-booking/refund' },
 
  'GET /tables/my-tables-booked': { action: 'tables/my-tables-booked' }, // lists specific table booking
  'GET /tables/approved-list': { action: 'tables/approved-list' },
  'GET /tables/pending-list': { action: 'tables/pending-list' },

  'POST /tables/photo-upload': { action: 'tables/photo-upload' },
  'POST /tables/create-by-admin': { action: 'tables/create-by-admin' },
  'PUT /tables/approve-table': { action: 'tables/approve-table' }, //approve-table changed to table-status
  'GET /tables/list-by-members-cateogry': { action: 'tables/list-by-members-cateogry' },

  'GET /tables/list-admin': { action: 'tables/list-admin' },

  testPayment: function (req, res) {
    return res.sendFile('testpyament.html', { root: './assets' });
  }
  'GET /table-booking/pay-order/:id': { action: 'table-booking/pay-order' },
  'post /table-booking/payout-host': { action: 'table-booking/payout-host' },

*/

