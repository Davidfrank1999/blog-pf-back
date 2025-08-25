//Keeps controllers clean:
//You don’t need try/catch in every route handler.

/**
 * Wraps async route/controller functions and passes errors to Express error handler
 * @param {Function} fn - async function (req, res, next)
 * @returns {Function} wrapped function
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
