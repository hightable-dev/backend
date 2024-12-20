/**
 * @author mohan <mohan@studioq.co.in>
 */

/* global _, ProfileManagers /sails */
/* global _, Users /sails */

var bcrypt = require('bcryptjs');
var SALT_WORK_FACTOR = 10;
var crypto = require('crypto');

module.exports = function create(request, response) {

    const post_request_data = request.body;
    var _response_object = {};
    var filtered_post_data = _.pick(post_request_data, ['first_name','username','interests','pronoun','instagram_link','linkedin_link','x_link','age','gender','email']);
    // const filtered_post_keys = Object.keys(filtered_post_data);
    var input_attributes = [
        { name: 'first_name', required: true },
        { name: 'username' },
        { name: 'email' },
        { name: 'interests' },
        { name: 'pronoun' },
        { name: 'instagram_link' },
        { name: 'linkedin_link' },
        { name: 'x_link' },
        { name: 'age' },
        { name: 'gender' },

    ];
    
    const sendResponse = (message, details) => {
        _response_object.message = message;
        return response.ok(_response_object);
    };

    const createUsers = (post_data, message) => {
        ProfileMembers.create(post_data, async function (err, ProfileMembers) {
            if (ProfileMembers) {
                sendResponse(message, ProfileMembers);
            } else {
                await errorBuilder.build(err, function (error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.serverError(_response_object);
                });
            }
        });
    }

    validateModel.validate(ProfileMembers, input_attributes, filtered_post_data, function (valid, errors) {
        if (valid) {
            createUsers(filtered_post_data);
        } else {
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.badRequest(_response_object);
        }
    })
};
