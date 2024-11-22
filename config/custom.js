/**
 * Custom configuration
 * (sails.config.custom)
 *
 * One-off settings specific to your application.
 *
 * For more information on custom configuration, visit:
 * https://sailsjs.com/config/custom
 */

const path = require('path');

module.exports.custom = {
  //sails.config.custom.statusCode.active;
  //sails.config.custom.statusCode.follower;
  //sails.config.custom.statusCode.bookmark_save;
  //sails.config.custom.plans.standard;

  roles: {
    admin: 0,
    manager: 1,
    member: 2
  },

  statusCode: {
    inactive: 0,
    active: 1
  },

  tableExpense: {
    byHost: 1,
    split: 2
  },

  tableStatusCode: {
    pending: 2,
    noImage: 99,
    approved: 3,
    reject: 4,
    cancelled: 6,
    eventExpired: 7,
    eventCompleted: 8,
    follower: 14,
    bookingClosed: 15,
    followerUsers: 19,
    deletedAccountTables: 20,
    eventStatusPending: 21,
    bookmarkTable: 22,
    autoCancelledMinSeatsNotBooked: 34
  },

  paymentStatusCode: {
    payPending: 5,
    paymentSuccess: 9,
    eventAttended: 10,
    bookingConfirmationPendingByCreator: 11,
    bookingRejectByCreator: 12,
    bookingCancelledByUser: 13,
    orederExpired: 16,
    refundRequest: 17,
    refundSuccess: 18,
  },

  tableType: {
    standard: 1,
    premium: 2,
  },
  orderByStatus: {
    orderO1: '01',
    orderO2: '02',
    orderO3: '03',
    orderO4: '04',
    orderO5: '05',
    orderO6: '06',
  },
  
  errorTypeCodes: {
    razorpayErr: 1,
    createOrderErr: 2,
    paymentErr: 3,
    refundErr: 4
  },

  //sails.config.custom.plans.standard;

  plans: {
    standard: 1,
    premium: 2
  },

  s3_bucket_options: {
    base_url: {
      table_photo: 'https://s3.ap-south-1.amazonaws.com/high-table-2024/public/photo/tables/',
      table_video: "https://s3.ap-south-1.amazonaws.com/high-table-2024/public/video/tables/",
    },
    table_photo: {
      hd: "https://s3.ap-south-1.amazonaws.com/high-table-2024/public/photo/tables/hd/",
      standardResolution: 'https://s3.ap-south-1.amazonaws.com/high-table-2024/public/photo/tables/standardResolution/'
    },
    table_video: {
      hd: "https://s3.ap-south-1.amazonaws.com/high-table-2024/public/video/tables/hd/",
      standardResolution: 'https://s3.ap-south-1.amazonaws.com/high-table-2024/public/video/tables/standardResolution/'
    },
    profile_photo: "https://s3.ap-south-1.amazonaws.com/high-table-2024/public/photo/members/",
    category_photo: 'https://s3.ap-south-1.amazonaws.com/high-table-2024/public/image/interests/',
  },
  /** 
   * image: ['image/jpg', 'image/png', 'image/jpeg'],
   * video: ['video/mp4', 'video/m4v'],
    * 
    * */
  fileTypes: {
    image: ['image/jpg', 'image/png', 'image/jpeg'],
    video: ['video/mp4', 'video/m4v'],
  },
  //sails.config.custom.s3_bucket_options;

  /**
   * 
   * */
  filePath: {
    tablesVideo: "https://s3.ap-south-1.amazonaws.com/high-table/public/video/tables/",
    tablesMedia: "https://s3.ap-south-1.amazonaws.com/high-table/public/photo/tables/",
    interests: "https://s3.ap-south-1.amazonaws.com/high-table/public/image/interests/",
    users: "https://s3.ap-south-1.amazonaws.com/high-table/public/photo/users/",
    members: "https://s3.ap-south-1.amazonaws.com/high-table/public/photo/members/",
  },


  file_path: {
    tablesVideo: "https://s3.ap-south-1.amazonaws.com/high-table/public/video/tables/",
    tablesPhoto: "https://s3.ap-south-1.amazonaws.com/high-table/public/photo/tables/",
    interestsPhoto: "https://s3.ap-south-1.amazonaws.com/high-table/public/image/interests/",
    userPhoto: "https://s3.ap-south-1.amazonaws.com/high-table/public/photo/users/",
    memberPhoto: "https://s3.ap-south-1.amazonaws.com/high-table/public/photo/members/",
    managerPhoto: "https://s3.ap-south-1.amazonaws.com/high-table/public/photo/managers/",
  },

  uploadFilePath: {
    tables: {
      "path": "https://s3.ap-south-1.amazonaws.com/high-table",
      "folder": "public/photo/tables",
      "example": "https://s3.ap-south-1.amazonaws.com/high-table/public/photo/tables/tables-media-123.jpeg"
    },
    tablesMedia: {
      "path": "https://s3.ap-south-1.amazonaws.com/high-table",
      "folder": "public/photo/tables",
      "example": "https://s3.ap-south-1.amazonaws.com/high-table/public/video/tables/tables-media-123.jpeg"
    },
    interests: {
      "path": "https://s3.ap-south-1.amazonaws.com/high-table",
      "folder": "public/image/interests",
      "example": "https://s3.ap-south-1.amazonaws.com/high-table/public/image/interests/interests-images-456.jpeg"
    },
    users: {
      "path": "https://s3.ap-south-1.amazonaws.com/high-table",
      "folder": "public/photo/users",
      "example": "https://s3.ap-south-1.amazonaws.com/high-table/public/photo/users/users-photo-789.jpeg"
    },
  },


  /**************************************************************************
   *                                                                         *
   * The base URL to use during development.                                 *
   *                                                                         *
   * • No trailing slash at the end                                          *
   * • `http://` or `https://` at the beginning.                             *
   *                                                                         *
   * > This is for use in custom logic that builds URLs.                     *
   * > It is particularly handy for building dynamic links in emails,        *
   * > but it can also be used for user-uploaded images, webhooks, etc.      *
   *                                                                         *
   **************************************************************************/
  baseUrl: "http://localhost:1337",

  /**************************************************************************
   *                                                                         *
   * Display dates for your app                                              *
   *                                                                         *
   * > This is here to make it easier to change out the copyright date       *
   * > that is displayed all over the app when it's first generated.         *
   *                                                                         *
   **************************************************************************/
  platformCopyrightYear: "2021",


  push_messages: {
    questionnaire_create: {
      title: "hightbale App ",
      message: "{USERNAME} responded to your questionnaire.",
    },
    time_slot_accepted: {
      title: "hightbale App ",
      message: "{USERNAME} accepted to meet you in-person.",
    },
    time_slot_requested: {
      title: "hightbale App ",
      message: "{USERNAME} requested to meet you in-person.",
    },
  },

  /**************************************************************************
   *                                                                         *
   * The TTL (time-to-live) for various sorts of tokens before they expire.  *
   *                                                                         *
   **************************************************************************/
  passwordResetTokenTTL: 24 * 60 * 60 * 1000, // 24 hours
  emailProofTokenTTL: 24 * 60 * 60 * 1000, // 24 hours

  /**************************************************************************
   *                                                                         *
   * The extended length that browsers should retain the session cookie      *
   * if "Remember Me" was checked while logging in.                          *
   *                                                                         *
   **************************************************************************/
  rememberMeCookieMaxAge: 30 * 24 * 60 * 60 * 1000, // 30 days

  /**************************************************************************
   *                                                                         *
   * Automated email configuration                                           *
   *                                                                         *
   * Sandbox Sendgrid credentials for use during development, as well as any *
   * other default settings related to "how" and "where" automated emails    *
   * are sent.                                                               *
   *                                                                         *
   * (https://app.sendgrid.com/settings/api_keys)                            *
   *                                                                         *
   **************************************************************************/
  // sendgridSecret: 'SG.fake.3e0Bn0qSQVnwb1E4qNPz9JZP5vLZYqjh7sn8S93oSHU',
  //--------------------------------------------------------------------------
  // /\  Configure this to enable support for automated emails.
  // ||  (Important for password recovery, verification, contact form, etc.)
  //--------------------------------------------------------------------------

  // The sender that all outgoing emails will appear to come from.
  fromEmailAddress: "noreply@example.com",
  fromName: "The NEW_APP_NAME Team",

  // Email address for receiving support messages & other correspondences.
  // > If you're using the default privacy policy, this will be referenced
  // > as the contact email of your "data protection officer" for the purpose
  // > of compliance with regulations such as GDPR.
  internalEmailAddress: "support+development@example.com",

  // Whether to require proof of email address ownership any time a new user
  // signs up, or when an existing user attempts to change their email address.
  verifyEmailAddresses: false,

  /**************************************************************************
   *                                                                         *
   * Billing & payments configuration                                        *
   *                                                                         *
   * (https://dashboard.stripe.com/account/apikeys)                          *
   *                                                                         *
   **************************************************************************/
  // stripePublishableKey: 'pk_test_Zzd814nldl91104qor5911gjald',
  // stripeSecret: 'sk_test_Zzd814nldl91104qor5911gjald',
  //--------------------------------------------------------------------------
  // /\  Configure these to enable support for billing features.
  // ||  (Or if you don't need billing, feel free to remove them.)
  //--------------------------------------------------------------------------

  /***************************************************************************
   *                                                                          *
   * Any other custom config this Sails app should use during development.    *
   *                                                                          *
   ***************************************************************************/
  // …

  // linkedinClientId : process.env.LINKEDIN_CLIENT_ID,
  // linkedinClientSecret : process.env.LINKEDIN_CLIENT_SECRET

};


// global.linkedinClientId = module.exports.custom.linkedinClientId;
// global.linkedinClientSecret = module.exports.custom.tableStatusCode;
global.tableStatusCode = module.exports.custom.tableStatusCode;
global.tableType = module.exports.custom.tableType;
global.statusCode = module.exports.custom.statusCode;
global.paymentStatusCode = module.exports.custom.paymentStatusCode;
global.roles = module.exports.custom.roles;
global.file_path = module.exports.custom.file_path;
global.path = module.exports.custom.path;
global.tableExpense = module.exports.custom.tableExpense;


