/**
 * @author mohan <mohan@studioq.co.in>
 */

/* global _, ProfileManagers /sails */

const moment = require('moment');
const common = require('../../services/common');

module.exports = function list(request, response) {
  const { tablesPhoto, interestsPhoto, userPhoto, memberPhoto, managerPhoto } = file_path;

  const request_query = request.allParams();
  const { page, limit, search, date, to, category,status } = request_query;
  const filterData = []; // Specify fields to filter
  const searchColumns = ['first_name', 'last_name', 'email','uu_id']; // Specify columns to search in
  const dateFormatRegex = /^\d{2}-\d{2}-\d{4}$/;
  const filterCondition = [];
  const input_attributes = [
    { name: 'page', number: true, min: 1 },
    { name: 'limit', number: true, min: 1 }
  ];

  status ? filterCondition.push({ status: [parseInt(status)] }) : null;

  category ? filterCondition.push({ category: category }) : null;

  // Validate the date format
  if (date && !dateFormatRegex.test(date)) {
    return response.badRequest({ error: "Invalid date format. Please provide the date in DD-MM-YYYY format." });
  }

  // Validate the 'to' parameter format
  if (to && !dateFormatRegex.test(to)) {
    return response.badRequest({ error: "Invalid 'to' date format. Please provide the date in DD-MM-YYYY format." });
  }

  validateModel.validate(null, input_attributes, { page, limit }, async function (valid, errors) {
    if (valid) {
      const pageNumber = parseInt(page) || 1;
      const limitNumber = parseInt(limit) || 10;

      ProfileManagers.find()
      .sort([{created_at:'DESC'}])
      .exec(async (err, items) => {
        if (err) {
          console.error("Error occurred while fetching tables:", err);
          return response.serverError({ error: "Error occurred while fetching tables" });
        }

          let filteredItems = items;

          filteredItems = common.applyFilterConditionsAdmin(filteredItems, filterCondition);

          filteredItems.length === 0 ? response.ok({ message: [] }) : null;

          filteredItems = common.filterDataItems(filteredItems, filterData);

          search ? filteredItems = common.multiColumnSearch(search.toLowerCase(), filteredItems, searchColumns) : null;

          for (const item of filteredItems) {
            if (item) {
              const totalTablesCount = await Tables.count({ admin_id: item.id });
              item.tablesCreated = totalTablesCount;
            }
            item.photo = item.photo ? managerPhoto + item.photo : null;
          }

          const paginateItems = common.paginateData(filteredItems, pageNumber, limitNumber);
          const _response_object = {
            message: 'Managers list  retrieved successfully.',
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
