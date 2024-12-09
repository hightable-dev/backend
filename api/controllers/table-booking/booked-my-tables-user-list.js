/**
 * @author mohan
 * <mohan@studioq.co.in>
 */

/* global _, ProfileManagers, sails */
const _ = require('lodash');

module.exports = async function list(request, response) {
  try {
    const { paymentSuccess } = UseDataService; // Assuming this is defined in UseDataService
    const requestQuery = request.allParams();
    const filteredQueryData = _.pick(requestQuery, ['page', 'limit']);
    const excludeFields = ['created_at', 'updated_at', 'payment_details','refund_details','order_id','payment_id','seats']; // Fields to omit from results

    // Input validation schema
    const inputAttributes = [
      { name: 'page', number: true, min: 1 },
      { name: 'limit', number: true, min: 1 }
    ];

    async function buildCriteria() {
      let criteria = {}

      criteria.creator_id= ProfileMemberId(request)
      criteria.status = paymentSuccess;

      return criteria;
    }


    // Validate inputs
    validateModel.validate(TableBooking, inputAttributes, filteredQueryData, async (valid, errors) => {
      if (valid) {
        const page = parseInt(filteredQueryData.page) || 1;
        const limit = parseInt(filteredQueryData.limit) || 10;
        const skip = (page - 1) * limit;

        let criteria = await buildCriteria();
        // Fetch data with pagination
        const [items, totalItems] = await Promise.all([
          TableBooking.find({ where:criteria })
            .skip(skip)
            .limit(limit)
            .omit(excludeFields),
          TableBooking.count({ where:criteria })
        ]);

        // Use the refactored sendResponseList function
        await UseDataService.sendResponseList({
          items,
          totalItems,
          page,
          limit,
          response,
          inputAttributes,
          filePath: __filename,
          message:'Booked users list'

        });
      } else {
        // Handle validation errors
        return response.badRequest({
          errors,
          count: errors.length
        });
      }
    });
  } catch (error) {
    sails.log.error('Error in list:', error);
    return response.serverError({ error: "Error occurred while fetching interests" });
  }
};
