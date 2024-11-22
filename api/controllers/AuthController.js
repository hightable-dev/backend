const facebookConnet = require("../services/auth/facebookConnet");


module.exports = {
    fbConnect:  function (req, res) {
        return facebookConnet(req, res);  // Call the fbConnect function from the service
    }
};
