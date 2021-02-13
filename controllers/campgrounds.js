const Campground = require("../models/campground");

module.exports.index = async (_, response) => {
    const campgrounds = await Campground.find({});
    response.render("campgrounds/index", { campgrounds });
};

module.exports.createForm = async (_, response) => {
    console.log("Here");
    response.render("campgrounds/new");
};

module.exports.view = async (request, response) => {
    const { id } = request.params;
    // How to do nested populate
    const campground = await Campground.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("author");
    if (!campground) {
        request.flash("error", "Cannot find that campground");
        return response.redirect("/campgrounds");
    }
    response.render("campgrounds/show", { campground });
};

module.exports.editForm = async (request, response) => {
    const { id } = request.params;
    const campground = await Campground.findById(id);
    response.render("campgrounds/edit", { campground });
};

module.exports.create = async (request, response) => {
    const { title, location, image, description, price } = request.body.campground; // Use like this if in ejs we did campground[field]
    const campground = new Campground({ title, location, image, description, price });
    campground.author = request.user._id;
    await campground.save();
    request.flash("success", "You successfully added a campground");
    response.redirect(`/campgrounds/${campground._id}`);
};

module.exports.delete = async (request, response) => {
    const { id } = request.params;
    await Campground.findByIdAndDelete(id);
    response.redirect("/campgrounds");
};

module.exports.edit = async (request, response) => {
    const { title, location, image, description, price } = request.body.campground;
    const { id } = request.params;
    const campground = await Campground.findByIdAndUpdate(
        id,
        { title, location, image, description, price },
        { runValidators: true }
    );
    request.flash("success", "You successfully updated a campground");
    response.redirect(`/campgrounds/${campground._id}`);
};
