module.exports = {
  /**
   * Formats a date as 'dd-mm-yyyy'. Uses the current date if no date is provided.
   * 
   * @param {Date} [date] - The date to format. If not provided, the current date is used.
   * @returns {string} - The formatted date string.
   */
  ddmmyyyy: function (date) {
    // Use current date if no date is provided
    const currentDate = date instanceof Date ? date : new Date();

    // Extract day, month, and year
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = currentDate.getFullYear();

    // Return formatted date string
    return `${day}-${month}-${year}`;
  },

  ddmmyyyy_hhmm: function (date) {
    // Use current date if no date is provided
    const currentDate = date instanceof Date ? date : new Date();

    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = currentDate.getFullYear();
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}`;
  },

  ddmmyyyy_hhmmss: function (date) {
    console.log("ddmmyyyy_hhmmss 1", date);
    // Use current date if no date is provided
    let currentDate;

    // Check if the date is provided and is valid
    if (date instanceof Date && !isNaN(date)) {
      currentDate = date;
    } else if (typeof date === 'string' || typeof date === 'number') {
      // Try to parse the date string or timestamp
      currentDate = new Date(date);
      if (isNaN(currentDate)) {
        // If parsing fails, fallback to the current date
        currentDate = new Date();
      }
    } else {
      // Fallback to the current date
      currentDate = new Date();
    }

    console.log("ddmmyyyy_hhmmss 2", currentDate);

    // Extract date and time components
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = currentDate.getFullYear();
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');

    console.log("ddmmyyyy_hhmmss 3 result", `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`);
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  }
};
