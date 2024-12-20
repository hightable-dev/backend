// api/services/CriteriaService.js
const _ = require('lodash');
const moment = require('moment'); // Ensure moment.js is required if you're using it

module.exports = async function (data) {
    let criteria = {};
    // const { userType, tableType, category, from_date, to_date } = data;
    const { tableType, category, from_date, to_date } = data;

    // const tableStatus = userType === roles.admin ? data.tableStatus : undefined;

    // Add tableType to criteria if provided
    if (tableType) criteria.type = parseInt(tableType);
    if (category) criteria.category = parseInt(category);

    const newDate = new Date();
    const now = await UseDataService.dateHelper(newDate, 'YYYY-MM-DDTHH:mm:ss.SSSZ', 'YYYY-MM-DD HH:mm:ss');
    // Add status condition based on userType
    criteria.status = { '!=': UseDataService.listingTableStatusNotEqual };
    criteria.event_date = { '>': now }
    // Handle date filtering
    if (from_date && to_date) {

        const startDate = UseDataService.dateHelper(from_date, 'DD-MM-YYYY ', 'DD-MM-YYYY');
        // const startDate = moment(from_date, 'DD-MM-YYYY').startOf('day').format('YYYY-MM-DD HH:mm:ss');
        const endDate = UseDataService.dateHelper(from_date, 'DD-MM-YYYY', 'DD-MM-YYYY');

        // const endDate = moment(to_date, 'DD-MM-YYYY').endOf('day').format('YYYY-MM-DD HH:mm:ss');

        if (!moment(startDate, 'YYYY-MM-DD HH:mm:ss').isValid() || !moment(endDate, 'YYYY-MM-DD HH:mm:ss').isValid()) {
            throw new Error("Invalid date format. Please provide the date in DD-MM-YYYY format.");
        }

        criteria.event_date = {
            '>=': startDate,
            '<=': endDate
        };
    } else if (from_date) {

        const startDate = moment(from_date, 'DD-MM-YYYY').startOf('day').format('YYYY-MM-DD HH:mm:ss');
        if (!moment(startDate, 'YYYY-MM-DD HH:mm:ss').isValid()) {
            throw new Error("Invalid date format. Please provide the date in DD-MM-YYYY format.");
        }

        criteria.event_date = { '>=': startDate };
    }

    return criteria;
};
