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
  const IST_offset = 5.5;  // IST is UTC +5:30 hours
  timestamp.setHours(timestamp.getHours() + IST_offset);  // Add 5 hours and 30 minutes

  // Format the timestamp in ISO format
  const formattedTimestamp = timestamp.toISOString().replace('T', ' ').split('.')[0];

  // Log the error to the console
  sails.log.error(`[${formattedTimestamp}] ${req.method} ${req.originalUrl} - ${err.message}`);

  // Log file path (relative path from the current working directory)
  const logFilePath = path.join(__dirname, '../../logs/error.log');

  // Extracting a concise portion of the error stack (e.g., specific error location)
  const conciseStack = err.stack.split('\n')[1]; // Get the first line of the stack trace

  // Prepare the log message including the concise stack trace
  const conciseLogMessage = `[${formattedTimestamp}] ${req.method} ${req.originalUrl} - ${err.message}\nAt: ${conciseStack}\n\n`;

  // Ensure the 'logs' directory exists, and create it if necessary
  const logDirectory = path.dirname(logFilePath);
  if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
  }

  // Append the log message to the log file
  try {
    fs.appendFileSync(logFilePath, conciseLogMessage, 'utf8');
  } catch (writeErr) {
    sails.log.error(`Failed to write to log file: ${writeErr.message}`);
  }

  // Send the error response
  return res.status(statusCode).json(response);
};
