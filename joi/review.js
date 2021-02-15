const extension = require("./extensions");
const BaseJoi = require("joi");

const joi = BaseJoi.extend(extension);

module.exports.ReviewSchema = joi.object({
    review: joi
        .object({
            rating: joi.number().min(0).max(5).required(),
            body: joi.string().required().escapeHTML(),
        })
        .required(),
});
