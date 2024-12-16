const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

// Dynamically generate log file path with today's date in format api-logs_YYYYMMDD.log
const getLogFilePath = () => {
  const date = new Date();
  const formattedDate = date.toISOString().split('T')[0].replace(/-/g, ''); // Format as YYYYMMDD
  return path.join(__dirname, '../../logs', `api-logs-${formattedDate}.log`);
};

module.exports = function logger(req, res, next) {
  const logFilePath = getLogFilePath(); // Get the dynamic log file path

  // Check if the log file exists, and create it if it doesn't
  if (!fs.existsSync(logFilePath)) {
    fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
    fs.writeFileSync(logFilePath, '');
  }

  const startTime = performance.now();
  let errorDetails = null;

  // Error capturing middleware
  res.on('error', (err) => {
    errorDetails = {
      message: err.message,
      stack: err.stack,
    };
    logRequest(req, res, startTime, errorDetails, logFilePath);
  });

  res.on('finish', () => {
    logRequest(req, res, startTime, errorDetails, logFilePath);
  });

  // Proceed to the next middleware or route handler
  next();
};

function logRequest(req, res, startTime, errorDetails, logFilePath) {
  const duration = performance.now() - startTime;

  // Convert timestamp to IST (UTC+5:30)
  const timestamp = new Date(new Date().getTime() + (330 * 60000)).toISOString(); // Add 5 hours 30 minutes for IST

  const logEntry = {
    timestamp: timestamp, // Use IST timestamp
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    duration: `${duration.toFixed(2)} ms`,
    responseSize: `${res.getHeader('Content-Length') || 0} bytes`,
    // error: errorDetails, // You can include error if needed
  };

  // Read the log file and append the new log entry without removing old logs
  fs.readFile(logFilePath, 'utf8', (err, data) => {
    if (err && err.code !== 'ENOENT') {
      return;
    }

    const lines = data ? data.trim().split('\n') : [];

    // Add the new log entry at the end of the lines array
    lines.push(JSON.stringify(logEntry));

    // Write the updated lines back to the log file
    fs.writeFile(logFilePath, lines.join('\n') + '\n', (err) => {
      if (err) {
        throw ('Failed to write log:', err);
      }
    });
  });
}
