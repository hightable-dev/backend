const fs = require('fs');
const path = require('path');

module.exports = function errorHandler(err, req, res, next) {
  // Determine error type and status code
  const statusCode = err.status || 500;
  const response = {
    status: 'error',
    message: err.message || 'An unexpected error occurred.',
  };

  // Get the current timestamp in UTC and convert it to IST (UTC +5:30)
  const timestamp = new Date();
  const IST_offset = 5.3; // IST is UTC +5:30 hours
  timestamp.setHours(timestamp.getHours() + Math.floor(IST_offset));
  timestamp.setMinutes(timestamp.getMinutes() + (IST_offset % 1) * 60);

  // Format the timestamp in ISO format
  const formattedTimestamp = timestamp.toISOString().replace('T', ' ').split('.')[0];

  // Log the error to the console
  sails.log.error(`[${formattedTimestamp}] ${req.method} ${req.originalUrl} - ${err.message}`);

  // Ensure the 'logs' directory exists
  const logFilePath = path.join(__dirname, '../../logs/error.log');
  const logDirectory = path.dirname(logFilePath);
  if (!fs.existsSync(logDirectory)) {
    try {
      fs.mkdirSync(logDirectory, { recursive: true });
    } catch (mkdirErr) {
      sails.log.error(`Failed to create log directory: ${mkdirErr.message}`);
    }
  }

  // Prepare the log message
  const conciseStack = err.stack ? `At: ${(err.stack.split('\n')[1] || '').trim()}` : '';
  const logMessage = `[${formattedTimestamp}] ${req.method} ${req.originalUrl} - ${err.message}${conciseStack ? `\n${conciseStack}` : ''}\n`;

  // Log error details to the file
  try {
    fs.appendFileSync(logFilePath, logMessage, 'utf8');
  } catch (writeErr) {
    sails.log.error(`Failed to write to log file: ${writeErr.message}`);
  }

  // Send the error response
  return res.status(statusCode).json(response);
};


/* 
useage for error
throw { status: 400, message: 'Something went wrong!' };
throw new Error ('Something went wrong new errr!' );

 */