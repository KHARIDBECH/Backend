import ErrorResponse from '../utils/ErrorResponse.js';

const validate = (schema, source = 'body') => (req, res, next) => {
    const { error, value } = schema.validate(req[source]);
    if (error) {
        return next(new ErrorResponse(error.details[0].message, 400));
    }
    // Update the request object with the validated and cast values (like strings to numbers)
    req[source] = value;
    next();
};

export default validate;
