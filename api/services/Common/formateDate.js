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
    const currentDate = date ? date : new Date();


    const day = String(currentDate?.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = currentDate.getFullYear();
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}`;
  },

  ddmmyyyy_hhmmss: function (date) {
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

    // Extract date and time components
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = currentDate.getFullYear();
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  },

  hhmm24: function (datetimeString) {
    return datetimeString.split(' ')[1]; // Returns the time part
  },

  hhmm12: function (datetimeString) {
    const timePart = datetimeString.split(' ')[1]; // Get the time part
    let [hours, minutes] = timePart.split(':');
    hours = parseInt(hours, 10);

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    return `${hours}:${minutes} ${ampm}`;
  },



  convertDateFormat: function (dateStr, inputFormat, requiredFormat) {

    // Parse the date string according to the input format
    const parsedDate = this.parseDate(dateStr, inputFormat);

    if (isNaN(parsedDate.getTime())) {
      // If parsing fails, fallback to the current date
      console.warn("Invalid date format. Using current date instead.");
      return this.formatDate(new Date(), requiredFormat);
    }

    // Format the parsed date according to the required format
    return this.formatDate(parsedDate, requiredFormat);
  },

  // Function to parse date according to the specified format
  parseDate: function (dateStr, format) {
    const formatParts = format.split(' ');
    const datePartFormat = formatParts[0] || '';
    const timePartFormat = formatParts[1] || '';

    const [datePart, timePart] = dateStr?.split(' ');
    const [day, month, year] = (datePart || '').split(/[-/\.]/).map(Number);
    const [hour = 0, minute = 0, second = 0] = (timePart || '00:00:00').split(':').map(Number);

    let yearNum, monthNum, dayNum;

    // Parse the date part based on the format
    switch (datePartFormat) {
      case 'dd-mm-yyyy':
        dayNum = day;
        monthNum = month - 1; // Months are 0-based
        yearNum = year;
        break;
      case 'mm-dd-yyyy':
        dayNum = day;
        monthNum = month - 1; // Months are 0-based
        yearNum = year;
        break;
      case 'yyyy-mm-dd':
        dayNum = day;
        monthNum = month - 1; // Months are 0-based
        yearNum = year;
        break;
      case 'dd/mm/yyyy':
        dayNum = day;
        monthNum = month - 1; // Months are 0-based
        yearNum = year;
        break;
      case 'mm/dd/yyyy':
        dayNum = day;
        monthNum = month - 1; // Months are 0-based
        yearNum = year;
        break;
      case 'yyyy/mm/dd':
        dayNum = day;
        monthNum = month - 1; // Months are 0-based
        yearNum = year;
        break;
      default:
        console.warn(`Unsupported date part format: ${datePartFormat}`);
        return new Date(); // Fallback to current date
    }

    // Create and return the Date object
    return new Date(yearNum, monthNum, dayNum, hour, minute, second);
  },

  // Function to format date according to the required format
  formatDate: function (date, format) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return format
      .replace('yyyy', year)
      .replace('yy', year.toString().slice(-2))
      .replace('mm', month)
      .replace('dd', day)
      .replace('hh', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  },
  /**
    * Formats a date for either the start or end of the day.
    *
    * @param {string} dateStr - The date string in the format 'dd-mm-yyyy'.
    * @param {string} type - The type of day, either 'startDay' or 'endDay'.
    * @returns {string} - The formatted date string.
    */
  dayStartEndFormatter: function (dateStr, type) {
    // Parse the input date string
    const [day, month, year] = dateStr.split('-').map(Number);
    let date = new Date(year, month - 1, day);

    if (type === 'startDay') {
      // Set time to 00:00:00 for the start of the day
      return `${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year} 00:00`;
    } else if (type === 'endDay') {
      // Set time to 23:59:59 for the end of the day
      date.setDate(date.getDate() + 1); // Move to the next day
      return `${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year} 23:59:00`;
    } else {
      throw new Error("Invalid type. Use 'startDay' or 'endDay'.");
    }
  }


};

