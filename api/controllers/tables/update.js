/**
 * @author mohan <mohan@studioq.co.in>
 */

const DataService = require("../../services/DataService");

/* global _, ProfileManagers /sails */


module.exports = async function update(request, response) {

const {standard, premiumn } = tableType;
const {pending, approved, reject, bookingClosed } = tableStatusCode;

    try {
        const { id, type, media, title, description, min_seats, max_seats, category, phone, price, tags, address, city, event_date, location ,status} = request.body;
        const updateData = { type, media, title, description, min_seats, max_seats, category, phone, price, tags, address, city, event_date, location, status };
        let _response_object = {};

        // Validate input attributes
        const input_attributes = [
            { name: 'id', number: true, min: 1 },
            { name: 'type', number: true},
            { name: 'media' },
            { name: 'title' },
            { name: 'description' },
            { name: 'min_seats' },
            { name: 'max_seats' },
            { name: 'category',number: true },
            { name: 'phone' },
            { name: 'price' },
            { name: 'tags' },
            { name: 'address' },
            { name: 'status', number: true},
            { name: 'city' },
            { name: 'event_date' },
            { name: 'location' },
            { name: 'pincode' },
        ];

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
            console.log(updateData.location)

            await DataService.locationUtils.extractLocationDetails(
                {
                    x: updateData.location.lat,
                    y: updateData.location.lng
                }
            )
                .then(({ state, city, pincode }) => {
                    updateData.state = state;
                    updateData.city = city;
                    updateData.pincode = pincode;
                });
            // await DataService.locationUtils.extractLocationDetails(
            //     {
            //         x: updateData.location.lat,
            //         y: updateData.location.lng
            //     }
            // )
            // .then(({ state, city, pincode }) => {
            //     updateData.state = state;
            //     updateData.city = city;
            //     updateData.pincode = pincode;
            // });
        }

        // Initialize validateModel function
        validateModel.validate(Tables, input_attributes, request.body, async function (valid, errors) {
            if (valid) {
                try {
                    // Update data of the Tables
                    const updatedTable = await Tables.updateOne({ id }).set(updateData);

                    // If the table is not found, return an appropriate response
                    if (!updatedTable) {
                        return response.status(404).json({ error: 'Table not found' });
                    }

                    // Build and send response with updated details
                    _response_object.message = 'Table data has been updated successfully.';
                    return response.ok({ message: 'Table data updated successfully', details: updatedTable });
                } catch (error) {
                    console.error('Error updating table data:', error);
                    return response.status(500).json({ error: 'Error updating table data' });
                }
            } else {
                return response.status(400).json({ errors, count: errors.length });
            }
        });
    } catch (error) {
        console.error("Error occurred while updating Tables data:", error);
        response.status(500).json({ error: "Error occurred while updating Tables data" });
    }
};

