const moment = require('moment');
const momentTz = require('moment-timezone');

/**
 * Formats a date string from one format to another using Moment.js.
 *
 * @param {string} date - The date string to be formatted.
 * @param {string} inputFormat - The format of the input date string (e.g., 'DD-MM-YYYY').
 * @param {string} outputFormat - The desired format of the output date string (e.g., 'YYYY/MM/DD').
 * 
 * @returns {string} - The formatted date string in the desired output format.
 * 
 * @example
 * // Convert date from 'DD/MM/YYYY' to 'YYYY-MM-DD'
 * const formattedDate = formatDate('30/12/2024', 'DD/MM/YYYY', 'YYYY-MM-DD');
 */
module.exports = (date, inputFormat, outputFormat = 'YYYY-MM-DD HH:mm:ss') => {
  // Common function for formatting dates in IST and 24-hour format
  const withoutTimeZone = moment(date, inputFormat).format(outputFormat);
  const withTimeZone = momentTz.tz(date, inputFormat, 'Asia/Kolkata').format(outputFormat);

/*   console.info({ date, inputFormat, outputFormat, withTimeZone, withoutTimeZone }); */

  return withTimeZone;
};



// module.exports = function convertToUTC(date, inputFormat, outputFormat) {
//   // Parse the date with the specified input format
//   let formattedDate = momentTz(date, inputFormat);

//   // Convert to UTC timezone, then format according to the output format
//   formattedDate = formattedDate.utc().format(outputFormat);

//   console.info({ convertToUTC: formattedDate });
//   return formattedDate;
// }




// const inputDate = '2024-10-04T06:01:06.838Z';
// const inputFormat = 'YYYY-MM-DDTHH:mm:ss.SSSZ';
// const outputFormat = 'DD-MM-YYYY'; //

/* 
  let now = new Date();
  let eventDate = item.event_date;
  const reportedHost = await ReportHost.findOne({ user_id: ProfileMemberId(req), table_id: id })
  const reportedTable = await ReportTable.findOne({ user_id: ProfileMemberId(req), table_id: id })
  now = moment(now, "YYYY-MM-DD HH:mm").toDate();
  now = moment.utc(now).tz("Asia/Kolkata").format('YYYY-MM-DD HH:mm:ss');
  now = moment.tz(now, "YYYY-MM-DD HH:mm").toDate();
  eventDate = moment(eventDate, "DD-MM-YYYY HH:mm").toDate();
  eventDate = moment.utc(eventDate).tz("Asia/Kolkata").format('YYYY-MM-DD HH:mm:ss');
  eventDate = moment.tz(eventDate, "DD-MM-YYYY HH:mm").toDate();

 */