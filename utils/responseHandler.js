/**
 * @desc    Success response helper
 */
export const sendResponse = (res, statusCode, data, message = 'Success') => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

/**
 * @desc    Error response helper (standardizes how we wrap errors if not using errorHandler middleware)
 */
export const sendError = (res, statusCode, message = 'Error') => {
    return res.status(statusCode).json({
        success: false,
        error: message,
    });
};
