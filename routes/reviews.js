const express = require("express");
const Review = require("../models/review");
const joiReview = require("../joi/review");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const ExpressError = require("../utils/expressError");
const Campground = require("../models/campground");
const { isLoggedIn } = require("../middleware/middleware");

// Use this line to have access all parameters
// { mergeParams: true }
// when using routers
const router = express.Router({ mergeParams: true });

const validateReview = (request, _, next) => {
    const { error } = joiReview.ReviewSchema.validate(request.body);
    if (error) {
        const errors = error.details.map(({ message }) => message).join(", ");
        throw new ExpressError(errors, 400);
    } else {
        next();
    }
};

router.post(
    "/",
    isLoggedIn,
    validateReview,
    asyncErrorHandler(async (request, response) => {
        const { campgroundId } = request.params;
        const { body, rating } = request.body.review;
        const campground = await Campground.findById(campgroundId).populate("reviews");
        const review = Review({ body, rating });
        campground.reviews.push(review);
        await review.save();
        await campground.save();
        request.flash("success", "Successfully created a new review");
        response.redirect(`/campgrounds/${campground._id}`);
    })
);

router.delete(
    "/:reviewId",
    isLoggedIn,
    asyncErrorHandler(async (request, response) => {
        const { campgroundId, reviewId } = request.params;
        // pull tells mongo to remove form collection
        await Campground.findByIdAndUpdate(campgroundId, { $pull: { review: reviewId } });
        await Review.findByIdAndDelete(reviewId);
        request.flash("success", "Successfully deleted the review");
        response.redirect(`/campgrounds/${campgroundId}`);
    })
);

module.exports = router;
