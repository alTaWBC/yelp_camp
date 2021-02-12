const express = require("express");
const Review = require("../models/review");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const Campground = require("../models/campground");
const { isLoggedIn, validateReview, isReviewAuthor } = require("../middleware/middleware");

// Use this line to have access all parameters
// { mergeParams: true }
// when using routers
const router = express.Router({ mergeParams: true });

router.post(
    "/",
    isLoggedIn,
    validateReview,
    asyncErrorHandler(async (request, response) => {
        const { id } = request.params;
        const { body, rating } = request.body.review;
        const campground = await Campground.findById(id).populate("reviews");
        const review = Review({ body, rating });
        review.author = request.user._id;
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
    isReviewAuthor,
    asyncErrorHandler(async (request, response) => {
        const { id, reviewId } = request.params;
        // pull tells mongo to remove form collection
        await Campground.findByIdAndUpdate(id, { $pull: { review: reviewId } });
        await Review.findByIdAndDelete(reviewId);
        request.flash("success", "Successfully deleted the review");
        response.redirect(`/campgrounds/${id}`);
    })
);

module.exports = router;
