const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const Review = require("../models/review");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const joiCampground = require("../joi/campground");
const joiReview = require("../joi/review");
const ExpressError = require("../utils/expressError");

const validateCampground = (request, _, next) => {
    const { error } = joiCampground.CampgroundSchema.validate(request.body);
    if (error) {
        const errors = error.details.map(({ message }) => message).join(", ");
        throw new ExpressError(errors, 400);
    } else {
        console.log("No Errors");
        next();
    }
};

const validateReview = (request, _, next) => {
    const { error } = joiReview.ReviewSchema.validate(request.body);
    if (error) {
        const errors = error.details.map(({ message }) => message).join(", ");
        throw new ExpressError(errors, 400);
    } else {
        console.log("No Errors");
        next();
    }
};

router.get(
    "/",
    asyncErrorHandler(async (request, response) => {
        const campgrounds = await Campground.find({});
        response.render("campgrounds/index", { campgrounds });
    })
);

router.get(
    "/new",
    asyncErrorHandler(async (request, response) => {
        response.render("campgrounds/new");
    })
);

router.get(
    "/:id",
    asyncErrorHandler(async (request, response) => {
        const { id } = request.params;
        const campground = await Campground.findById(id).populate("reviews");
        response.render("campgrounds/show", { campground });
    })
);

router.get(
    "/:id/edit",
    asyncErrorHandler(async (request, response) => {
        const { id } = request.params;
        const campground = await Campground.findById(id);
        response.render("campgrounds/edit", { campground });
    })
);

router.post(
    "/",
    validateCampground,
    asyncErrorHandler(async (request, response, next) => {
        const { title, location, image, description, price } = request.body.campground; // Use like this if in ejs we did campground[field]
        const campground = new Campground({ title, location, image, description, price });
        await campground.save();
        response.redirect(`/campgrounds/${campground._id}`);
    })
);

router.post(
    "/:id/reviews",
    validateReview,
    asyncErrorHandler(async (request, response) => {
        const { id } = request.params;
        const { body, rating } = request.body.review;
        const campground = await Campground.findById(id).populate("reviews");
        const review = Review({ body, rating });
        campground.reviews.push(review);
        await review.save();
        await campground.save();
        response.redirect(`/campgrounds/${campground._id}`);
    })
);

router.patch(
    "/:id",
    validateCampground,
    asyncErrorHandler(async (request, response) => {
        const { title, location, image, description, price } = request.body.campground;
        const { id } = request.params;
        const campground = await Campground.findByIdAndUpdate(
            id,
            { title, location, image, description, price },
            { runValidators: true }
        );
        response.redirect(`/campgrounds/${campground._id}`);
    })
);

router.delete(
    "/:id",
    asyncErrorHandler(async (request, response) => {
        const { id } = request.params;
        await Campground.findByIdAndDelete(id);
        response.redirect("/campgrounds");
    })
);

router.delete(
    "/:campgroundId/reviews/:reviewId",
    asyncErrorHandler(async (request, response) => {
        const { campgroundId, reviewId } = request.params;
        console.log(campgroundId, reviewId);
        // pull tells mongo to remove form collection
        await Campground.findByIdAndUpdate(campgroundId, { $pull: { review: reviewId } });
        await Review.findByIdAndDelete(reviewId);
        response.redirect(`/campgrounds/${campgroundId}`);
    })
);

module.exports = router;
