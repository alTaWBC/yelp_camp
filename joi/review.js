const joi = require("joi");

module.exports.ReviewSchema = joi.object({
    review: joi
        .object({
            rating: joi.number().min(0).max(5).required(),
            body: joi.string().required(),
        })
        .required(),
});
