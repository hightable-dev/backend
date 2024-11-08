
/**
 *
 * @author mohan <mohan@studioq.co.in>
 *
 */

/* 

/* global _, Tables, moment, errorBuilder, validateModel */

const moment = require('moment');
const DataService = require('../../services/DataService');

module.exports = async function create(request, response) {
    const logged_in_user = request.user;
    const { standard, premium } = tableType;
    const { pending, approved, rejected, bookingClosed, deletedAccountTables } = tableStatusCode;
    const { inactive } = sails.config.custom.statusCode;

    const post_request_data = request.body;
    var _response_object = {};
    var filtered_post_data = _.pick(post_request_data, ['type', 'media', 'min_seats', 'max_seats', 'title', 'category', 'address', 'city', 'description', 'event_date', 'price', 'tags', 'created_by', 'status', 'location', 'phone', 'user_type', 'event_done_flag', 'city', 'state', 'pincode', 'user_profile']);
    var input_attributes = [
        { name: 'type', required: true, number: true },
        { name: 'media' },
        { name: 'description' },
        { name: 'title' },
        { name: 'min_seats' },
        { name: 'max_seats' },
        { name: 'category', required: true },
        { name: 'phone' },
        { name: 'price' },
        { name: 'tags' },
        { name: 'created_by', number: true },
        { name: 'address', required: true },
        { name: 'city' },
        { name: 'event_date', required: true },
        { name: 'status' },
        { name: 'location', required: true },
        { name: 'user_type' },
        { name: 'event_done_flag' },
        { name: 'city' },
        { name: 'state' },
        { name: 'pincode' },
        { name: 'user_profile' },
    ];

    // filtered_post_data.created_by = parseInt(profileId);
    filtered_post_data.created_by = ProfileMemberId(request);
    filtered_post_data.user_profile = ProfileMemberId(request);
    filtered_post_data.user_type = request.user.types;
    filtered_post_data.event_done_flag = false;
    if (filtered_post_data.location) {
        await DataService.locationUtils.extractLocationDetails(
            {
                x: filtered_post_data.location.lat,
                y: filtered_post_data.location.lng
            }
        )
            .then(({ state, city, pincode }) => {
                filtered_post_data.state = state;
                filtered_post_data.city = city;
                filtered_post_data.pincode = pincode;
            });
    }

    let adminProfileId;
    if (UserType(request) === roles.admin) {
        adminProfileId = ProfileAdminId(request);
    }
    if (UserType(request) === roles.manager) {
        adminProfileId = ProfileManagerId(request);
    }
    if (UserType(request) === roles.member) {
        adminProfileId = 0; // self created
    }
    filtered_post_data.admin_id = adminProfileId;
    filtered_post_data.user_type = UserType(request);

    const sendResponse = (message, details) => {
        _response_object.message = message;
        _response_object.details = details; // Include details in the response
        return response.ok(_response_object);
    };

    const createTables = (post_data) => {
        Tables.create(post_data, async function (err, createdTable) {
            if (createdTable) {
                const users = await Followers.find({ creator_profile_id: createdTable?.created_by });

                if (users.length > 0) {
                    for (const data of users) {
                        const user = await Users.findOne({ profile_members: data?.follower_profile_id });
                        await notificationService({
                            senderId: logged_in_user?.profile_members,
                            type: 'TableCreate',
                            message: `New table found .`,
                            receiverId: user?.profile_members,
                            followUser: null,
                            tableId: createdTable?.id,
                            payOrderId: '',
                            isPaid: false,
                            templateId: 'createTable',
                            roomName: 'TableCreate_',
                            creatorId: null,
                            status: 1,
                            pushMsgTitle: `${logged_in_user?.first_name} created ${createdTable?.title} table`,    // Title, Name ...
                            pushMessage: `New table found from '${logged_in_user?.first_name}'.`
                        });
                    }
                }

                const countRecordsCriteria = {
                    created_by: ProfileMemberId(request),
                    status: { '!=': [inactive] }
                };

                const totalTablesCount = await DataService.countRecord({
                    criteria: countRecordsCriteria,
                    modelName: 'Tables'
                });

                const updateRecordCriteria = {
                    id: ProfileMemberId(request),

                };
                const updateRecordData = {
                    table_count: totalTablesCount,

                };

                const updatedData = await DataService.updateRecord({
                    matchCriteria: updateRecordCriteria,
                    values: updateRecordData,
                    modelName: 'ProfileMembers'
                });

                console.log('totalTablesCount', totalTablesCount, updatedData)





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

    // Retrieve the user details from the ProfileMembers. table
    ProfileMembers.findOne({ id: ProfileMemberId(request) }).exec(async (err, user) => {
        if (err) {
            return response.status(500).json({ error: 'Error occurred while fetching user details' });
        }

        if (!user) {
            return response.status(404).json({ error: 'User not found' });
        }

        // Concatenate first and last names to form the full name
        const full_name = `${user.first_name} ${user.last_name}`;

        // Update the full_name field in the filtered_post_data object
        filtered_post_data.full_name = full_name;

        // Parse the event_date string using Moment.js
        // const eventDate = moment(filtered_post_data.event_date, 'DD/MM/YYYY hh:mm');

        // Check if the date is valid
        // if (eventDate.isValid()) {
            // Format the date as desired
            // const formattedDate = eventDate.format('DD-MM-YYYY HH:mm:ss');

            // Set the formatted date in the filtered_post_data object
            filtered_post_data.event_date = DataService.formatDate.ddmmyyyy_hhmmss(filtered_post_data.event_date);
            console.log(' filtered_post_data.event_date', filtered_post_data.event_date)

            // Validate and create the table
            validateModel.validate(Tables, input_attributes, filtered_post_data, async function (valid, errors) {
                if (filtered_post_data.category) {
                    filtered_post_data.category = parseInt(filtered_post_data.category);
                }

                const lastEntry = await StandardTable.find().limit(1).sort([{ created_at: 'DESC' }]);
                const standardTableLatestPrice = lastEntry[0].price;
                if (filtered_post_data.type === standard) {
                    filtered_post_data.status = approved;
                    filtered_post_data.price = standardTableLatestPrice; // Set price to 99 for standard type
                }
                if (filtered_post_data.type === premium) {
                    filtered_post_data.status = pending;
                }


                if (valid) {
                    createTables(filtered_post_data);
                    await Tables.updateTablesCount(ProfileMemberId(request));
                } else {
                    _response_object.errors = errors;
                    _response_object.count = errors.length;
                    return response.status(400).json(_response_object);
                }
            });
        // } else {
        //     return response.status(400).json({ error: 'Invalid date format' });
        // }
    });
};
