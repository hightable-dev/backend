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


  'GET /fb-connect': 'FbController.fbConnect',

  /*====================== Login & Users Ends Here ======================*/
  '/': function (request, response) {
    response.ok({ message: 'Welcome to Test API.' });
  },

  '/logged-successful': function (request, response) {
    response.ok({ message: 'logged-successful' });
  },

  /*=====================    Manager    ===================*/
  'POST /manager/create': { action: 'manager/create' },
  'POST /manager/photo-upload': { action: 'manager/photo-upload' },
  'PUT /manager/activate': { action: 'manager/activate' },
  'PUT /manager/update': { action: 'manager/update' },
  'GET /manager/view': { action: 'manager/view' },
  'GET /manager/list': { action: 'manager/list', swagger: swaggerDocs?.managerlistSwagger },

  /*=================   Tags   =================*/
  'GET /tags/list': { action: 'tags/list' , swagger: swaggerDocs?.tagslistSwagger },

  /*=================   Intrest   =================*/
  'POST /interests/create': { action: 'interests/create' },
  'POST /interests/image-upload': { action: 'interests/image-upload' },
  'GET /interests/list': { action: 'interests/list', swagger: swaggerDocs?.interestslistSwagger },
 
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
  'GET /table-booking/booked-my-tables-user-list': { action: 'table-booking/booked-my-tables-user-list' },
  'GET /table-booking/booked-all-my-list': { action: 'table-booking/booked-all-my-list' },
  'GET /table-booking/booked-my-tables': { action: 'table-booking/booked-my-tables' },
  'POST /table-booking/book-table': { action: 'table-booking/book-table', },
  'POST /table-booking/capture-payment': { action: 'table-booking/capture-payment' },
  'POST /table-booking/refund-payment': { action: 'table-booking/refund-payment' },
  'POST /table-booking/cancel-booking': { action: 'table-booking/cancel-booking' },

  /*=====================    Reviews / Ratings   =====================*/
  'POST /reviews/give-feedback': { action: 'reviews/give-feedback', swagger: swaggerDocs?.reviewsgivefeedbackSwagger },

  /*=====================    Wishlist / Bookmarks   =====================*/
  'POST /bookmark/create': { action: 'bookmark/create' , swagger: swaggerDocs?.bookmarkcreateSwagger },
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

  /*=====================Reports =====================*/
  'POST /report/create-host': { action: 'report/create-host' },
  'POST /report/create-table': { action: 'report/create-table' },

  /****Table booking view not used anywher this api justmaking payment for testing hightable payment***** */
  'GET /testpayment': function (request, response) {
    return response.sendFile('testpayment.html', { root: './assets' });
  },
  'GET /table-booking/view': { action: 'table-booking/view' },

  /**************************** Linkedin ***************************/
  'GET /status-codes': { action: 'allStausCodes/index' },
  'POST /test-email-service': async function (req, res) {
    try {
      const result = await emailNotification(req.body); // Pass request data if needed
      return res.ok({ message: result });
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
