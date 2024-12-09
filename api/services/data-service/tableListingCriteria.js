// api/services/CriteriaService.js
const _ = require('lodash');
const moment = require('moment'); // Ensure moment.js is required if you're using it

module.exports = async function (data) {
    let criteria = {};
    const { userType, tableType, category, address, from_date, to_date } = data;

    const tableStatus = userType === roles.admin ? data.tableStatus : undefined;

    // Add tableType to criteria if provided
    if (tableType) criteria.type = parseInt(tableType);
    if (category) criteria.category = parseInt(category);

    const newDate = new Date();
    let findCity = null;
    let wordCount = 0;
    const now = UseDataService.dateHelper(newDate, 'YYYY-MM-DDTHH:mm:ss.SSSZ', 'YYYY-MM-DD HH:mm:ss');

    // Add status condition based on userType
    switch (userType) {
        case roles.admin:
            if(tableStatus){
             criteria.status = { in: [tableStatus] };

            }
            break;

        case roles.manager:
            // Managers should see all statuses, so no need to filter by status
            break;

        case roles.member:
            criteria.status = { '!=': UseDataService.listingTableStatusNotEqual };
            criteria.event_date = { '>': now } // 
            if (address) {
                const locality = await UseDataService.locationUtils.geocodeLocation(address);
                const { latitude, longitude } = locality
                const getLocalCity = await UseDataService.locationUtils
                    .extractLocationDetails({
                        x: latitude,
                        y:longitude,
                    })
                findCity = getLocalCity?.city;
                findByDistrict = getLocalCity?.district.split(' ')[0];
                wordCount = _.size(_.split(_.replace(address.split(',')[0], /[^a-zA-Z\s]/g, ''), ' '));
                criteria = {
                    ...criteria,
                    ...(wordCount > 1 ? { address: address ? { contains: address } : null } : { district: findByDistrict ? { contains: findByDistrict } : null })
                };

            } else {
                criteria = {
                    address: address ? { contains: address } : null,
                }
            }
            break;
        default:
        // criteria// Default case
    }

    // Handle date filtering
    if (from_date && to_date) {
        const startDate = moment(from_date, 'DD-MM-YYYY').startOf('day').format('YYYY-MM-DD HH:mm:ss');
        const endDate = moment(to_date, 'DD-MM-YYYY').endOf('day').format('YYYY-MM-DD HH:mm:ss');

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
