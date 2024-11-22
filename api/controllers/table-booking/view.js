const _ = require('lodash');

module.exports = function list(request, response) {
    const request_query = request.allParams();
    const filtered_query_data = _.pick(request_query, [' table_id', 'user_id', 'status', 'id']);
    const { table_id, user_id, status, id } = request_query;
    // Input attributes validation schema
    const input_attributes = [
        { name: 'table_id' },
        { name: 'user_id' },
        { name: 'status' },
    ];

    // Build the query criteria for fetching the table
    const buildCriteria = () => {
        let criteria = {};
        if(id){
            criteria.id = id;
        }else{
           criteria = { table_id, user_id, status }
        }
        return criteria;
    }

    // Function to send the response with the fetched data
    const sendResponse = (item) => {
        return response.ok({
            details: item,  // Return the fetched item directly
        });
    };

    // Validate input attributes and proceed if valid
    validateModel.validate(null, input_attributes, filtered_query_data, async function (valid, errors) {
        if (valid) {
            try {
                const criteria =  buildCriteria();
                // Fetch table data and populate related entities
                const item = await TableBooking.findOne(criteria)

                if (!item) {
                    return response.notFound({ message: 'Table not found' });
                }

                // Send the fetched item in response
                sendResponse(item);
            } catch (error) {
                console.error("Error fetching data:", error);
                return response.serverError({ message: "Internal Server Error" });
            }
        } else {
            return response.status(400).json({
                errors,
                count: errors.length,
            });
        }
    });
};
