/* global _, Tables, moment, errorBuilder, validateModel */
/**
 * @author mohan <mohan@studioq.co.in>
 */

/* global _, ProfileManagers /sails */
const moment = require('moment');
const bcrypt = require('bcryptjs');
const SALT_WORK_FACTOR = 10;
const crypto = require('crypto');

module.exports = function create(request, response) {
    const post_request_data = request.body;
    var _response_object = {};
    var filtered_post_data = _.pick(post_request_data, ['type', 'media', 'min_seats', 'max_seats', 'title', 'category', 'address', 'city', 'description', 'event_date', 'price', 'tags', 'created_by', 'created_for', 'status', 'location', 'phone']);
    var input_attributes = [
        { name: 'type', required: true },
        { name: 'media' },
        { name: 'description' },
        { name: 'min_seats' },
        { name: 'max_seats' },
        { name: 'category' },
        { name: 'phone' },
        { name: 'price' },
        { name: 'tags' },
        { name: 'created_by' },
        { name: 'created_for' },
        { name: 'admin_id' },
        { name: 'user_type' },
        { name: 'address' },
        { name: 'city' },
        { name: 'event_date' },
        { name: 'status' },
        { name: 'location' },
    ];

    // const current_user_id = filtered_post_data.created_by; // Statically declared
    // const profileId = request.user.profile_managers;
    const forProfileId = filtered_post_data.created_for;
    filtered_post_data.created_by = filtered_post_data.created_for;

    let adminProfileId;
    if (UserType(request) === 0) {
        adminProfileId = ProfileAdminId(request)
    }
    if (UserType(request) === 1) {
        adminProfileId = ProfileManagerId(request)
    }

    // filtered_post_data.admin_id = parseInt(profileId);
    filtered_post_data.admin_id = adminProfileId;
    // filtered_post_data.user_type = request.user.types;
    filtered_post_data.user_type = UserType(request);

    const sendResponse = (message, details) => {
        _response_object.message = message;
        _response_object.details = details; // Include details in the response
        return response.ok(_response_object);
    };

    const createTables = (post_data) => {

        Tables.create(post_data, async function (err, createdTable) {

            if (createdTable) {
                sendResponse("Table created successfully.", createdTable);
            } else {
                await errorBuilder.build(err, function (error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            }
        });
    }

    // if (filtered_post_data.type === sails.config.custom.plans.standard.standard) {
    //     filtered_post_data.status = sails.config.custom.statusCode.approved;
    //     filtered_post_data.price = sails.config.custom.plans.standard.price; // Set price to 99 for standard type
    // } else if (filtered_post_data.type === sails.config.custom.plans.premium) {
    //     // filtered_post_data.status = sails.config.custom.statusCode.pending;
    //     filtered_post_data.status = tableStatusCode.pending;
    // }
    // const lastEntry = await StandardTable.find().limit(1).sort([{ created_at: 'DESC' }]);
    //             const standardTableLatestPrice =  lastEntry[0].price;

    // if (filtered_post_data.type === tableType.standard) {
    //     // if (filtered_post_data.type === sails.config.custom.plans.standard.standard) {
    //     // filtered_post_data.status = sails.config.custom.statusCode.approved;
    //     filtered_post_data.status = tableStatusCode.approved;
    //     filtered_post_data.price = standardTableLatestPrice; // Set price to 99 for standard type
    // // } else if (filtered_post_data.type === sails.config.custom.plans.premium) {
    // } else if (filtered_post_data.type === tableType.premium) {
    //     filtered_post_data.status = tableStatusCode.pending;
    // }

    // Retrieve the user details from the ProfileMembers. table
    ProfileMembers.findOne({ id: forProfileId }).exec(async (err, user) => {
        if (err) {
            return response.status(500).json({ error: 'Error occurred while fetching user details' });
        }

        if (!user) {
            return response.status(404).json({ error: 'Profile Members not found' });
        }

        // Concatenate first and last names to form the full name
        const full_name = `${user.first_name} ${user.last_name}`;

        // Update the full_name field in the filtered_post_data object
        filtered_post_data.full_name = full_name;

        // Parse the event_date string using Moment.js
        const eventDate = moment(filtered_post_data.event_date, 'DD/MM/YYYY hh:mm');

        // Check if the date is valid
        if (eventDate.isValid()) {
            // Format the date as desired
            const formattedDate = eventDate.format('DD-MM-YYYY HH:mm');

            // Set the formatted date in the filtered_post_data object
            filtered_post_data.event_date = formattedDate;

            // Validate and create the table
            validateModel.validate(Tables, input_attributes, filtered_post_data, async function (valid, errors) {
                if (filtered_post_data.category) {
                    filtered_post_data.category = parseInt(filtered_post_data.category);
                }
                // if (filtered_post_data.created_by) {
                //     filtered_post_data.created_by = parseInt(filtered_post_data.created_by);
                // }

                const lastEntry = await StandardTable.find().limit(1).sort([{ created_at: 'DESC' }]);
                const standardTableLatestPrice = lastEntry[0].price;
                if (filtered_post_data.type === tableType.standard) {
                    // if (filtered_post_data.type === sails.config.custom.plans.standard.standard) {
                    // filtered_post_data.status = sails.config.custom.statusCode.approved;
                    filtered_post_data.status = tableStatusCode.approved;
                    filtered_post_data.price = standardTableLatestPrice; // Set price to 99 for standard type
                    // } else if (filtered_post_data.type === sails.config.custom.plans.premium) {
                } else if (filtered_post_data.type === tableType.premium) {
                    filtered_post_data.status = tableStatusCode.pending;
                }
                if (valid) {
                    createTables(filtered_post_data);
                } else {
                    _response_object.errors = errors;
                    _response_object.count = errors.length;
                    return response.status(400).json(_response_object);
                }
            });
        } else {
            return response.status(400).json({ error: 'Invalid date format' });
        }
    });
};
