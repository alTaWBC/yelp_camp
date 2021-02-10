const express = require("express");
const router = express.Router();
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const joiCampground = require("../joi/campground");
const ExpressError = require("../utils/expressError");
const Campground = require("../models/campground");


const validateCampground = (request, _, next) => {
    const { error } = joiCampground.CampgroundSchema.validate(request.body);
    if (error) {
        const errors = error.details.map(({ message }) => message).join(", ");
        throw new ExpressError(errors, 400);
    } else {
        next();
    }
};

router.get(
    "/",
    asyncErrorHandler(async (_, response) => {
        const campgrounds = await Campground.find({});
        response.render("campgrounds/index", { campgrounds });
    })
);

router.get(
    "/new",
    asyncErrorHandler(async (_, response) => {
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
    asyncErrorHandler(async (request, response) => {
        const { title, location, image, description, price } = request.body.campground; // Use like this if in ejs we did campground[field]
        const campground = new Campground({ title, location, image, description, price });
        await campground.save();
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

module.exports = router;
