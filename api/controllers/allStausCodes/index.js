module.exports = function allStatusCodes(request, response) {
     const statusCodesObj = {
          roles,
          tableType,
          statusCode,
          tableStatusCode,
          paymentStatusCode,
          // file_path
     }

     return response.ok(statusCodesObj)
}


// global.tableStatusCode = module.exports.custom.tableStatusCode;
// global.tableType = module.exports.custom.tableType;
// global.statusCode = module.exports.custom.statusCode;
// global.paymentStatusCode = module.exports.custom.paymentStatusCode;
// global.roles = module.exports.custom.roles;
// global.file_path = module.exports.custom.file_path;