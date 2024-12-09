const bookmarkcreate = require('./bookmark/create.json');
const bookmarkcreateSwagger = bookmarkcreate['/bookmark/create'];
const tagslist = require('./tags/list.json');
const tagslistSwagger = tagslist['/tags/list'];
const defaultmedia = require('./default/media.json');
const defaultmediaSwagger = defaultmedia['//media/smileserver/git/hightable-backend/api/controllers/interests/list.js'];
const defaulthome = require('./default/home.json');
const defaulthomeSwagger = defaulthome['//home/studioq/Documents/HighTable/hightable-backend/api/controllers/table-booking/booked-my-tables-user-list.js'];
const tableslistpublic = require('./tables/list-public.json');
const tableslistpublicSwagger = tableslistpublic['/tables/list-public'];
const tableslistfeaturetablepublic = require('./tables/list-feature-table-public.json');
const tableslistfeaturetablepublicSwagger = tableslistfeaturetablepublic['/tables/list-feature-table-public'];
const reviewsgivefeedback = require('./reviews/give-feedback.json');
const reviewsgivefeedbackSwagger = reviewsgivefeedback['/reviews/give-feedback'];
const interestslist = require('./interests/list.json');
const interestslistSwagger = interestslist['/interests/list'];
const tablesmylist = require('./tables/my-list.json');
const tablesmylistSwagger = tablesmylist['/tables/my-list'];
const tableslist = require('./tables/list.json');
const tableslistSwagger = tableslist['/tables/list'];
const tablestablesearch = require('./tables/table-search.json');
const tablestablesearchSwagger = tablestablesearch['/tables/table-search'];
const bookmarklist = require('./bookmark/list.json');
const bookmarklistSwagger = bookmarklist['/bookmark/list'];
const tablescreate = require('./tables/create.json');
const tablescreateSwagger = tablescreate['/tables/create'];
const managerlist = require('./manager/list.json');
const managerlistSwagger = managerlist['/manager/list'];
const tablescanceltable = require('./tables/cancel-table.json');
const tablescanceltableSwagger = tablescanceltable['/tables/cancel-table'];
const apicontrollers = require('./api/controllers.json');
const apicontrollersSwagger = apicontrollers['/api/controllers/tables/view.js'];
const tablesview = require('./tables/view.json');
const tablesviewSwagger = tablesview['/tables/view'];
const tableshighbooked = require('./tables/high-booked.json');
const tableshighbookedSwagger = tableshighbooked['/tables/high-booked'];
const getlist = require('./get/list.json');
const getlistSwagger = getlist['user/get'];

let swaggerRefs = [  
    { key: 'user/get', refs: 'getlistSwagger' },
    { key: 'tables/high-booked', refs: 'tableshighbookedSwagger' },
    { key: 'tables/view', refs: 'tablesviewSwagger' },
    { key: 'api/controllers/tables/view.js', refs: 'apicontrollersSwagger' },
    { key: 'tables/cancel-table', refs: 'tablescanceltableSwagger' },
    { key: 'manager/list', refs: 'managerlistSwagger' },
    { key: 'tables/create', refs: 'tablescreateSwagger' },
    { key: 'bookmark/list', refs: 'bookmarklistSwagger' },
    { key: 'tables/table-search', refs: 'tablestablesearchSwagger' },
    { key: 'tables/list', refs: 'tableslistSwagger' },
    { key: 'tables/my-list', refs: 'tablesmylistSwagger' },
    { key: 'interests/list', refs: 'interestslistSwagger' },
    { key: 'reviews/give-feedback', refs: 'reviewsgivefeedbackSwagger' },
    { key: 'tables/list-feature-table-public', refs: 'tableslistfeaturetablepublicSwagger' },
    { key: 'tables/list-public', refs: 'tableslistpublicSwagger' },
    { key: '/home/studioq/Documents/HighTable/hightable-backend/api/controllers/table-booking/booked-my-tables-user-list.js', refs: 'defaulthomeSwagger' },
    { key: '/media/smileserver/git/hightable-backend/api/controllers/interests/list.js', refs: 'defaultmediaSwagger' },
    { key: 'tags/list', refs: 'tagslistSwagger' },
    { key: 'bookmark/create', refs: 'bookmarkcreateSwagger' },
];
module.exports = {
    bookmarkcreateSwagger,
    tagslistSwagger,
    defaultmediaSwagger,
    defaulthomeSwagger,
    tableslistpublicSwagger,
    tableslistfeaturetablepublicSwagger,
    reviewsgivefeedbackSwagger,
    interestslistSwagger,
    tablesmylistSwagger,
    tableslistSwagger,
    tablestablesearchSwagger,
    bookmarklistSwagger,
    tablescreateSwagger,
    managerlistSwagger,
    tablescanceltableSwagger,
    apicontrollersSwagger,
    tablesviewSwagger,
    tableshighbookedSwagger,
    getlistSwagger,
    swaggerRefs,
};

