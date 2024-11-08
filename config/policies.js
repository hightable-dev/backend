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

  'interests/users-interests-list': ['oauthBearer'],
  // 'users/profile': ['oauthBearer'],
  'users/list': true,
  'users/create': true,
  'users/update': ['oauthBearer'],
  "users/view": ['oauthBearer'],
  'users/login-email': true,
  'users/notification-status': true,
  'users/photo-upload': ['oauthBearer'],
  // 'users/update': ['oauthBearer'],
  'users/notification': ['oauthBearer'],
  'users/notification-status': ['oauthBearer'],

  /************************  Standard Tables ************************/ 
  'standard-table/set-price': ['oauthBearer', 'isAdmin'],
  'standard-table/view-price': ['oauthBearer', 'isAdmin'],

  /************************  Tables ************************/ 
  'tables/my-list': ['oauthBearer'],
  'tables/create': ['oauthBearer', 'isMember'],
  'tables/create-by-admin': ['oauthBearer', 'isManagerOrAdmin'],
  'tables/table-status': ['oauthBearer','isManagerOrAdmin'],
  'tables/cancel-table': ['oauthBearer'],
  'tables/my-tables-list': ['oauthBearer'],
  'tables/list': ['oauthBearer'],
  'tables/list-amdin': ['oauthBearer','isManagerOrAdmin'],
  'tables/update': ['oauthBearer'],
  'tables/table-search': ['oauthBearer'],
  // 'tables/list-by-members-cateogry': ['oauthBearer'],
  'tables/view': ['oauthBearer'],
  'tables/view-web': true,

  // 'tables/photo-upload': ['oauthBearer'],
  'tables/high-booked': ['oauthBearer'],
  'tables/approved-list': ['oauthBearer'],
  'tables/pending-list': ['oauthBearer', 'isManagerOrAdmin'],
  // 'tables/approve-table': ['oauthBearer'],

  'tables/event-status-host': ['oauthBearer'],
  'tables/event-status-user': ['oauthBearer'],

  /************************  Bookmark ************************/ 
  'bookmark/create': ['oauthBearer'],
  'bookmark/list': ['oauthBearer'],

  /************************  Profile Members ************************/ 
  'profile-members/list': ['oauthBearer'],
  'profile-members/profile': ['oauthBearer'],
  'profile-members/update': ['oauthBearer'],
  'profile-members/view': ['oauthBearer'],
  'profile-members/view-admin': ['oauthBearer','isAdmin'],
  'profile-members/activate': ['oauthBearer', 'isAdmin'],
  'profile-members/destroy-user': ['oauthBearer'],

  /************************ Table Booking ************************/ 
  'table-booking':{
    'list-admin': ['oauthBearer','isManagerOrAdmin'],
    'list': ['oauthBearer'],
    'book-table': ['oauthBearer', 'isMember'],
    'booked-list-all': ['oauthBearer'],
    'booked-my-tables': ['oauthBearer'],
    'booked-my-tables-user-list': ['oauthBearer'],
    'booked-all-my-list': ['oauthBearer'],
    'capture-payment': ['oauthBearer'],
    'refund': ['oauthBearer','isAdmin'],
    'refund-payment': ['oauthBearer'],
    'pay-order': ['oauthBearer'],
    'accept-booking': ['oauthBearer'],

  },
  'reviews/give-feedback': ['oauthBearer'],
  'followers/create': ['oauthBearer'],
 

  /************************ Managers ************************/ 
  // 'manager/list': ['oauthBearer','isAdmin'],
  'manager/view': ['oauthBearer','isAdmin'],
  'manager/create': ['oauthBearer','isAdmin'],
  'manager/activate': ['oauthBearer','isAdmin'],
  'manager/update': ['oauthBearer','isAdmin'],
  'manager/photo-upload': ['oauthBearer','isAdmin'],

  /************************ Razorpay  ************************/ 
  'razorpay/create-account': ['oauthBearer'],
  'payout-host/payment-to-host': ['oauthBearer'],
};

