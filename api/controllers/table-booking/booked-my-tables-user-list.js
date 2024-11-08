/**
 * @author mohan <mohan@studioq.co.in>
 */

/* global _, ProfileManagers /sails */

const moment = require('moment');
const common = require('../../services/common');

module.exports = function list(request, response) {

  const { pending, expired, paymentSuccess} = paymentStatusCode;


  const request_query = request.allParams();
  const { page, limit, search, date, to, category, table_id } = request_query;
  const filterData = ['order_id', 'payment_id', 'expiry_date', 'category', 'amount', 'created_by', "payment_details", "created_at", "updated_at"]; 
  const searchColumns = ['full_name', 'address', 'title']; 
  const dateFormatRegex = /^\d{2}-\d{2}-\d{4}$/;
  const filterCondition = [{ status: [paymentSuccess] }];
  const input_attributes = [
    { name: 'page', number: true, min: 1 },
    { name: 'limit', number: true, min: 1 }
  ];

  if (category) {
    filterCondition.push({ category: category });
  }
  if (table_id) {
    filterCondition.push({ table_id: table_id });
  }

  if (date && !dateFormatRegex.test(date)) {
    return response.badRequest({ error: "Invalid date format. Please provide the date in DD-MM-YYYY format." });
  }

  if (to && !dateFormatRegex.test(to)) {
    return response.badRequest({ error: "Invalid 'to' date format. Please provide the date in DD-MM-YYYY format." });
  }

  validateModel.validate(null, input_attributes, { page, limit }, async function (valid, errors) {
    if (valid) {
      const pageNumber = parseInt(page) || 1;
      const limitNumber = parseInt(limit) || 10;

      TableBooking.find()
        .sort([{ created_at: 'DESC' }])
        .exec(async (err, tables) => {
          if (err) {
            console.error("Error occurred while fetching tables:", err);
            return response.serverError({ error: "Error occurred while fetching tables" });
          }

          let filteredItems = tables;
          filteredItems = common.applyFilterConditions(filteredItems, filterCondition);

          if (filteredItems.length === 0) {
            return response.badRequest({ message: 'No data found' });
          }

          filteredItems = common.filterDataItems(filteredItems, filterData);

          if (search) {
            filteredItems = common.multiColumnSearch(search.toLowerCase(), filteredItems, searchColumns);
          }

          if (date && to) {
            const startDate = moment(date, 'DD-MM-YYYY');
            const endDate = moment(to, 'DD-MM-YYYY').endOf('day');

            if (!startDate.isValid() || !endDate.isValid()) {
              return response.badRequest({ error: "Invalid date format. Please provide the date in DD-MM-YYYY format." });
            }

            filteredItems = filteredItems.filter(table => {
              const eventDate = moment(table.event_date, 'YYYY-MM-DD HH:mm');
              return eventDate.isBetween(startDate, endDate, null, '[]');
            });
          } else if (date) {
            const parsedDate = moment(date, 'DD-MM-YYYY');

            if (!parsedDate.isValid()) {
              return response.badRequest({ error: "Invalid date format. Please provide the date in DD-MM-YYYY format." });
            }

            filteredItems = filteredItems.filter(table => {
              const eventDate = moment(table.event_date, 'YYYY-MM-DD HH:mm');
              return eventDate.isSame(parsedDate, 'day');
            });
          }

          if (filteredItems.length === 0) {
            return response.notFound({ message: 'No data found' });
          }

          for (const item of filteredItems) {
            try {
                const user = await ProfileMembers.findOne({ id: parseInt(item.user_id) });
        
                if (user) {

                  if (user.phone) {
                    await phoneEncryptor.decrypt(user.phone, function (decrypted_text) {
                      user.phone = decrypted_text;
                    });
                  }

                  
                    // Extract only email and first_name from user_details
                    const userDetails = {
                        phone: user.phone,
                        full_name: user.first_name + ' ' + user.last_name,
                        photo: user.photo ? sails.config.custom.filePath.members + user.photo : null
                    };
        
                    item.user_details = userDetails;
                } else {
                    item.user_details = "No user found";
                }
            } catch (error) {
                console.error("Error finding user details:", error);
            }
        }
        

          const paginateItems = common.paginateData(filteredItems, pageNumber, limitNumber);

          const _response_object = {
            message: 'Tables retrieved successfully.',
            meta: {
              page: pageNumber,
              limit: limitNumber,
              total: filteredItems.length,
            },
            items: paginateItems
          };

          return response.ok(_response_object);
        });
    } else {
      const _response_object = {
        errors: errors,
        count: errors.length
      };
      return response.badRequest(_response_object);
    }
  });
};
