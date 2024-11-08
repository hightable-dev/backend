const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../../logs/api-requests.log');
const MAX_LINES = 2000;

module.exports = function logger(req, res, next) {
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
    logError(req, res, startTime, errorDetails);
  });

  res.on('finish', () => {
    logError(req, res, startTime, errorDetails);
  });

  // Proceed to the next middleware or route handler
  next();
};

function logError(req, res, startTime, errorDetails) {
  const duration = performance.now() - startTime;
  const logEntry = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    duration: `${duration.toFixed(2)} ms`,
    responseSize: `${res.getHeader('Content-Length') || 0} bytes`,
    error: errorDetails ? errorDetails.message : null,
  };

  // Read the log file and manage log rotation
  fs.readFile(logFilePath, 'utf8', (err, data) => {
    if (err && err.code !== 'ENOENT') {
      console.error('Failed to read log file:', err);
      return;
    }

    const lines = data ? data.trim().split('\n') : [];

    // Add the new log entry at the end of the lines array
    lines.push(JSON.stringify(logEntry));

    // If the number of lines exceeds MAX_LINES, remove the oldest lines
    if (lines.length > MAX_LINES) {
      // Calculate how many lines need to be removed to keep within MAX_LINES
      lines.splice(0, lines.length - MAX_LINES);
    }

    // Write the updated lines back to the log file
    fs.writeFile(logFilePath, lines.join('\n') + '\n', (err) => {
      if (err) {
        console.error('Failed to write log:', err);
      }
    });
  });
}
