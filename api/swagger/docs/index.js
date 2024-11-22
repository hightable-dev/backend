const getlist = require('./get/list.json');
const getlistSwagger = getlist['user/get'];

let swaggerRefs = [    { key: 'user/get', refs: 'getlistSwagger' },
];
module.exports = {
    getlistSwagger,
    swaggerRefs,
};
