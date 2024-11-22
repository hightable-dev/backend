
/**
 *
 * @author sabarinathan <sabarinathan@studioq.co.in>
 *
 */

/* global _, Users /sails */

var bcrypt = require('bcryptjs');
var SALT_WORK_FACTOR = 10;
var crypto = require('crypto');

module.exports = function create(request, response) {
    const post_request_data = request.body;
    var _response_object = {};
    var filtered_post_data = _.pick(post_request_data, ['first_name']);
    // const filtered_post_keys = Object.keys(filtered_post_data);
    var input_attributes = [
        { name: 'first_name', required: true },
        // { name: 'user_role' },
    ];
    const sendResponse = (message, details) => {
        _response_object.message = message;
        return response.ok(_response_object);
    };

    const createUsers = (post_data, message) => {
        consoel.log("createUsers",{post_data, message})
        Users.create(post_data, async function (err, Users) {
            if (Users) {
                sendResponse(message, Users);
            } else {
                await errorBuilder.build(err, function (error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            }
        });
    }

    validateModel.validate(Users, input_attributes, filtered_post_data, function (valid, errors) {
        if (valid) {
            createUsers(filtered_post_data);
        } else {
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    })
};
