const joiCampground = require("../joi/campground");
const ExpressError = require("../utils/expressError");
const Campground = require("../models/campground");
const joiReview = require("../joi/review");

module.exports.isLoggedIn = (request, response, next) => {
    if (!request.isAuthenticated()) {
        request.session.returnTo = request.originalUrl;
        request.flash("error", "You must be signed in");
        return response.redirect("/login");
    }
    next();
};

module.exports.isAuthor = async (request, response, next) => {
    const { id } = request.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(request.user._id)) {
        request.flash("error", "You do not have permission to do that!");
        return response.redirect(`/campgrounds/${id}`);
    }
    next();
};

module.exports.validateCampground = (request, _, next) => {
    const { error } = joiCampground.CampgroundSchema.validate(request.body);
    if (error) {
        const errors = error.details.map(({ message }) => message).join(", ");
        throw new ExpressError(errors, 400);
    } else {
        next();
    }
};

module.exports.validateReview = (request, _, next) => {
    const { error } = joiReview.ReviewSchema.validate(request.body);
    if (error) {
        const errors = error.details.map(({ message }) => message).join(", ");
        throw new ExpressError(errors, 400);
    } else {
        next();
    }
};
