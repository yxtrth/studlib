/**
 * Wraps async route handlers to catch unhandled Promise rejections
 * @param {Function} fn - The async route handler function
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
