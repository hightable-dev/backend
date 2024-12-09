const moment = require('moment-timezone');

module.exports = (date, inputFormat = 'YYYY-MM-DD HH:mm', outputFormat = 'YYYY-MM-DD HH:mm:ss') => {
  /*  If date is a string, trim it; otherwise, assume it's already a Date object */
  const dateStr = typeof date === 'string' ? date.trim() : date;

  /*  Parse the date with the specified input format and timezone */
  let eventDate = moment.tz(dateStr, inputFormat, "Asia/Kolkata");

  /*  Convert the parsed date to UTC and format it */
  const convertInputDateToUtc = eventDate.clone().utc().format(outputFormat);

  /* Convert to milliseconds timestamp */
  const milliSecondsFormattedInputDate = eventDate.valueOf();

  /* Convert the timestamp back to the original format for verification */
  const verifyMilliSecondsToInputDate = moment(milliSecondsFormattedInputDate).format(outputFormat);

  const now = new Date();
  let convertNowDate = moment.tz(now, "Asia/Kolkata");
  const timestampconvertNowDate = convertNowDate.valueOf();
  const convertConvertNowDate = convertNowDate.clone().utc().format(outputFormat);

  /* Convert the timestamp back to the original format for verification */
  const twoHours = 2 * 60 * 60 * 1000;
  const milliSecondsTwoHoursBeforeEventDate = milliSecondsFormattedInputDate - twoHours

  const verifyMillisecondsToDateBeforeTwoHours = moment(milliSecondsTwoHoursBeforeEventDate).format(outputFormat);

  const verifyTimestampconvertNowDate = moment(timestampconvertNowDate).format(outputFormat);
  const evnetDateBeforeTwoHours = verifyMillisecondsToDateBeforeTwoHours === verifyTimestampconvertNowDate
  const eventDateTimestampEqualNow = verifyMilliSecondsToInputDate === verifyTimestampconvertNowDate;
  const eventDateTimestampGreaterNow = verifyMilliSecondsToInputDate > verifyTimestampconvertNowDate;
  const eventDateTimestampLessThanNow = verifyMilliSecondsToInputDate < verifyTimestampconvertNowDate;

/* ============= Checking dates input and output after converting =============== start === */
  const checkingReultsDateObj = {
    now,
    convertNowDate,
    timestampconvertNowDate,
    convertConvertNowDate,
    verifyTimestampconvertNowDate,
    date,
    convertInputDateToUtc,
    verifyMillisecondsToDateBeforeTwoHours,
    milliSecondsFormattedInputDate,
    verifyMilliSecondsToInputDate,
    eventDateTimestampEqualNow,
    eventDateTimestampGreaterNow,
    eventDateTimestampLessThanNow,
  };
// Prints the resuts

/* ============= Checking dates input and output after converting =============== End === */


  const returnDataObj = {
    date,
    convertInputDateToUtc,
    milliSecondsFormattedInputDate,
    verifyMilliSecondsToInputDate,
    evnetDateBeforeTwoHours,
    milliSecondsTwoHoursBeforeEventDate,
    verifyMillisecondsToDateBeforeTwoHours,
    eventDateTimestampEqualNow,
    eventDateTimestampGreaterNow,
    eventDateTimestampLessThanNow
  }

  return returnDataObj;
};
