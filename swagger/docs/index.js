const interestslist = require('./interests/list.json');
const interestslistSwagger = interestslist['/interests/list'];
const getlist = require('./get/list.json');
const getlistSwagger = getlist['user/get'];

let swaggerRefs = [    { key: 'user/get', refs: 'getlistSwagger' },
    
    { key: 'interests/list', refs: 'interestslistSwagger' },
];
module.exports = {
    interestslistSwagger,
    getlistSwagger,
    swaggerRefs,
};
