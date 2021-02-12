const express = require("express");
const router = express.Router();
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const Campground = require("../models/campground");
const { isLoggedIn, validateCampground, isAuthor } = require("../middleware/middleware");



router.get(
    "/",
    asyncErrorHandler(async (_, response) => {
        const campgrounds = await Campground.find({});
        response.render("campgrounds/index", { campgrounds });
    })
);

router.get(
    "/new",
    isLoggedIn,
    asyncErrorHandler(async (request, response) => {
        response.render("campgrounds/new");
    })
);

router.get(
    "/:id",
    asyncErrorHandler(async (request, response) => {
        const { id } = request.params;
        const campground = await Campground.findById(id).populate("reviews").populate("author");
        if (!campground) {
            request.flash("error", "Cannot find that campground");
            return response.redirect("/campgrounds");
        }
        response.render("campgrounds/show", { campground });
    })
);

router.get(
    "/:id/edit",
    isLoggedIn,
    isAuthor,
    asyncErrorHandler(async (request, response) => {
        const { id } = request.params;
        const campground = await Campground.findById(id);
        response.render("campgrounds/edit", { campground });
    })
);

router.post(
    "/",
    validateCampground,
    asyncErrorHandler(async (request, response) => {
        const { title, location, image, description, price } = request.body.campground; // Use like this if in ejs we did campground[field]
        const campground = new Campground({ title, location, image, description, price });
        campground.author = request.user._id;
        await campground.save();
        request.flash("success", "You successfully added a campground");
        response.redirect(`/campgrounds/${campground._id}`);
    })
);

router.delete(
    "/:id",
    isLoggedIn,
    isAuthor,
    asyncErrorHandler(async (request, response) => {
        const { id } = request.params;
        await Campground.findByIdAndDelete(id);
        response.redirect("/campgrounds");
    })
);

router.patch(
    "/:id",
    isLoggedIn,
    isAuthor,
    validateCampground,
    asyncErrorHandler(async (request, response) => {
        const { title, location, image, description, price } = request.body.campground;
        const { id } = request.params;
        const campground = await Campground.findByIdAndUpdate(
            id,
            { title, location, image, description, price },
            { runValidators: true }
        );
        request.flash("success", "You successfully updated a campground");
        response.redirect(`/campgrounds/${campground._id}`);
    })
);

module.exports = router;
