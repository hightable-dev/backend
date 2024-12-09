/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

module.exports.policies = {

  'users/create': true,
  'users/update': ['oauthBearer'],
  "users/view": ['oauthBearer'],
  'users/notification-status': true,
  'users/photo-upload': ['oauthBearer'],
  'users/notification': ['oauthBearer'],
  'users/notification-status': ['oauthBearer'],

  /************************  Standard Tables ************************/
  'standard-table/set-price': ['oauthBearer', 'isAdmin'],
  'standard-table/view-price': ['oauthBearer', 'isAdmin'],

  /************************  Tables ************************/
  'tables/my-list': ['oauthBearer'],
  'tables/create': ['oauthBearer'],
  'tables/table-status': ['oauthBearer', 'isManagerOrAdmin'],
  'tables/cancel-table': ['oauthBearer'],
  'tables/list': ['oauthBearer'],
  'tables/update': ['oauthBearer'],
  'tables/table-search': ['oauthBearer'],
  'tables/view': ['oauthBearer'],
  'tables/view-web': true,
  'tables/high-booked': ['oauthBearer'],
  'tables/event-status-host': ['oauthBearer'],
  'tables/event-status-user': ['oauthBearer'],
  'tables/video-upload': ['oauthBearer'],
  'tables/media-upload': ['oauthBearer'],

  /************************  Bookmark ************************/
  'bookmark/create': ['oauthBearer'],
  'bookmark/list': ['oauthBearer'],

  /************************  Profile Members ************************/
  'profile-members/list': ['oauthBearer'],
  'profile-members/profile': ['oauthBearer'],
  'profile-members/update': ['oauthBearer'],
  'profile-members/view': ['oauthBearer'],
  'profile-members/view-admin': ['oauthBearer', 'isAdmin'],
  'profile-members/activate': ['oauthBearer', 'isAdmin'],
  'profile-members/destroy-user': ['oauthBearer'],
  'profile-members/photo-upload': ['oauthBearer'],

  /************************ Table Booking ************************/
  'table-booking/list-admin': ['oauthBearer', 'isManagerOrAdmin'],
  'table-booking/list': ['oauthBearer'],
  'table-booking/book-table': ['oauthBearer', 'isMember'],
  'table-booking/booked-my-tables-user-list': ['oauthBearer'],
  'table-booking/booked-all-my-list': ['oauthBearer'],
  'table-booking/capture-payment': ['oauthBearer'],
  'table-booking/refund-payment': ['oauthBearer'],
  'table-booking/accept-booking': ['oauthBearer'],
  'table-booking/cancel-booking': ['oauthBearer'],
  'reviews/give-feedback': ['oauthBearer'],
  'followers/create': ['oauthBearer'],

  /************************ Managers ************************/
  'manager/view': ['oauthBearer', 'isAdmin'],
  'manager/create': ['oauthBearer', 'isAdmin'],
  'manager/activate': ['oauthBearer', 'isAdmin'],
  'manager/update': ['oauthBearer', 'isAdmin'],
  'manager/photo-upload': ['oauthBearer', 'isAdmin'],

  /************************ Razorpay  ************************/
  'razorpay/create-account': ['oauthBearer'],

  /************************ Report  ************************/
  'report/create-host': ['oauthBearer'],
  'report/create-table': ['oauthBearer'],

};
