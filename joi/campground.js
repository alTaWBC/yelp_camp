const extension = require("./extensions");
const BaseJoi = require("joi");

const joi = BaseJoi.extend(extension)


module.exports.CampgroundSchema = joi.object({
    campground: joi
        .object({
            title: joi.string().required().escapeHTML(),
            price: joi.number().required().min(0),
            // image: joi.string().required(),
            location: joi.string().required().escapeHTML(),
            description: joi.string().required().escapeHTML(),
        })
        .required(),
    deleteImages: joi.array(),
});
