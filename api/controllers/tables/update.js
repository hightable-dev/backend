/**
 * @author mohan <mohan@studioq.co.in>
 */

const DataService = require("../../services/DataService");

/* global _, ProfileManagers /sails */


module.exports = async function update(request, response) {
    const { standard, premiumn, pending, approved, payPending, paymentSuccess, bookingConfirmationPendingByCreator } = UseDataService;

    try {
        const { id, type, media, title, description, min_seats, max_seats, category, phone, price, tags, address, city, event_date, location, status, event_done_flag, table_expense, district, inclusion, exclusions, location_details } = request.body;

        const updateData = { type, media, title, description, min_seats, max_seats, category, phone, price, tags, address, city, event_date, location, status, event_done_flag, table_expense, district, inclusion, exclusions, location_details };

        let _response_object = {};

        // Validate input attributes
        const input_attributes = [
            { name: 'id', number: true, min: 1 },
            { name: 'type', number: true },
            { name: 'media' },
            { name: 'title' },
            { name: 'description' },
            { name: 'min_seats' },
            { name: 'max_seats' },
            { name: 'category', number: true },
            { name: 'phone' },
            { name: 'price' },
            { name: 'tags' },
            { name: 'address' },
            { name: 'status', number: true },
            { name: 'city' },
            { name: 'event_date' },
            { name: 'district' },
            { name: 'location' },
            { name: 'pincode' },
            { name: 'event_done_flag' },
            { name: 'table_expense', number: true },
            { name: "inclusion" },
            { name: "exclusions" },
            { name: "location_details" },

        ];

        if (UserType(request) === roles.member) {
            const checkIsOwnerTable = await Tables.findOne({ id, created_by: ProfileMemberId(request) })
            if (!checkIsOwnerTable) {
                return response.serverError({ error: "You don't have access to edit the table." });
            }
        }

        // Fetch the latest price for standard tables
        const lastEntry = await StandardTable.find().limit(1).sort([{ created_at: 'DESC' }]);
        const standardTableLatestPrice = lastEntry[0].price;
        // Check the type and update accordingly
        if (type === standard) {
            updateData.status = approved;
            updateData.price = standardTableLatestPrice; // Set price to the latest price for standard tables
        } else if (type === premiumn) {
            updateData.status = pending;
        }
        if (updateData.location) {
            try {
                // Fetch detailed location using the first service
                const { detailedLocation } = await UseDataService.locationUtils.locationDetails({
                    x: updateData.location.lat,
                    y: updateData.location.lng,
                });
                updateData.location_details = detailedLocation;

                const { locality, postal_code, sublocality_level_2, sublocality_level_1, sublocality_level_3, administrative_area_level_3, formatted_address } = detailedLocation;

                // Extract location details using the second service
                const { state, city, pincode, formattedAddress, district } = await UseDataService.locationUtils.extractLocationDetails({
                    x: updateData.location.lat,
                    y: updateData.location.lng,
                });

                // Assign extracted location details to updateData
                updateData.state = state;
                if (sublocality_level_1) {
                    updateData.city = sublocality_level_1
                } else if (sublocality_level_2) {
                    updateData.city = sublocality_level_2
                } else if (sublocality_level_3) {
                    updateData.city = sublocality_level_3
                }
                updateData.pincode = pincode;
                updateData.format_geo_address = formattedAddress;
                updateData.district = district;

            } catch (error) {
                throw error;
                // Handle error accordingly, e.g., set a flag or throw an error
            }
        }

        const sendResponse = (message, details) => {
            _response_object.message = message;
            _response_object.details = details; // Include details in the response

            response.ok(_response_object);
            return;
        }
        // Initialize validateModel function
        validateModel.validate(Tables, input_attributes, request.body, async function (valid, errors) {
            if (valid) {
                try {
                    const msg = await UseDataService.messages({ tableId: id, userId: ProfileMemberId(request) }, updateData);
                    const bookingList = await UseDataService.bookingDataForCreator({
                        tableId: id,
                        userId: ProfileMemberId(request),
                        status: [payPending, paymentSuccess, bookingConfirmationPendingByCreator]
                    });

                    updateData.event_date = UseDataService.dateHelper(
                        updateData.event_date,
                        "DD-MM-YYYY HH:mm:ss",
                        "YYYY-MM-DD HH:mm:ss"
                    );

                    const updatedTable = await Tables.updateOne({ id }).set(updateData);
                    // If the table is not found, return an appropriate response

                    if (!updatedTable) {
                        return response.notFound({ error: 'Table not found' });
                    }

                    // Build and send response with updated details
                    // _response_object.message = 'Table data has been updated successfully.';
                    sendResponse('Table data updated successfully', { updatedTable, bookingList });

                    if (UserType(request) === roles.member) {
                        const msg = await UseDataService.messages({ tableId: id, userId: ProfileMemberId(request) }, updateData);

                        bookingList.forEach(async (item) => {
                            await UseDataService.sendNotification({
                                notification: {
                                    senderId: ProfileMemberId(request),
                                    type: "tableChanges",
                                    message: msg?.updateOnTableMsg,
                                    receiverId: item.user_id,
                                    followUser: null,
                                    tableId: id,
                                    payOrderId: "",
                                    isPaid: true,
                                    templateId: "tableChanges",
                                    roomName: "TableChanges_",
                                    creatorId: item.creator_id,
                                    status: 1, // approved
                                },
                                pushMessage: {
                                    title: "High Table",
                                },
                            });
                        });
                    }

                } catch (error) {
                    return response.serverError({ error: 'Error updating table data' });
                }
            } else {
                return response.badRequest({ errors, count: errors.length });
            }
        });
    } catch (error) {
        response.serverError({ error: "Error occurred while updating Tables data" });
    }
};
