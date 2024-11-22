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
];
module.exports = {
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

