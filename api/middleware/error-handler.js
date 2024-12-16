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
  const IST_offset = 5.5; // IST is UTC +5:30 hours
  timestamp.setHours(timestamp.getHours() + Math.floor(IST_offset));
  timestamp.setMinutes(timestamp.getMinutes() + (IST_offset % 1) * 60);

  // Format the timestamp in ISO format
  const formattedTimestamp = timestamp.toISOString().replace('T', ' ').split('.')[0];

  // Log the error to the console
  console.error(`[${formattedTimestamp}] ${req.method} ${req.originalUrl} - ${err.message}`);

  // Generate dynamic log filename based on today's date
  const logFileName = `error-logs-${new Date().toISOString().split('T')[0].replace(/-/g, '')}.log`;
  const logFilePath = path.join(__dirname, '../../logs', logFileName);
  const logDirectory = path.dirname(logFilePath);

  // Ensure the 'logs' directory exists
  if (!fs.existsSync(logDirectory)) {
    try {
      fs.mkdirSync(logDirectory, { recursive: true });
    } catch (mkdirErr) {
      console.error(`Failed to create log directory: ${mkdirErr.message}`);
    }
  }

  // Prepare the log message
  const conciseStack = err.stack ? `${(err.stack.split('\n')[1] || '').trim()}` : '';
  const logMessage = `[${formattedTimestamp}] ${req.method} ${req.originalUrl} - ${err.message}${conciseStack ? ` ${conciseStack}` : ''}\n`;

  // Log error details to the file
  try {
    fs.appendFileSync(logFilePath, logMessage, 'utf8');
  } catch (writeErr) {
    console.error(`Failed to write to log file: ${writeErr.message}`);
  }

  // Send the error response
  return res.status(statusCode).json(response);
};
