const Review = require("../models/review");
const Campground = require("../models/campground");

module.exports.create = async (request, response) => {
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
};

module.exports.delete = async (request, response) => {
    const { id, reviewId } = request.params;
    // pull tells mongo to remove form collection
    await Campground.findByIdAndUpdate(id, { $pull: { review: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    request.flash("success", "Successfully deleted the review");
    response.redirect(`/campgrounds/${id}`);
};
