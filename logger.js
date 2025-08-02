function logger(req, res, next) {
    const logEntry = `${new Date().toISOString()} - ${req.method} ${req.originalUrl}`;
    // Here we just print — in real case, you could write to a file
    process.stdout.write(logEntry + "\n");
    next();
}
module.exports = logger;
// logger.js
function logger(req, res, next)
    {
    const logEntry = `${new Date().toISOString()} - ${req.method} ${req.originalUrl}`;
    process.stdout.write(logEntry + "\n");
    next();
}
module.exports = logger;
