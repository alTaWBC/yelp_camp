const { cloudinary } = require("../cloudinary");
const Campground = require("../models/campground");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (_, response) => {
    const campgrounds = await Campground.find({});
    response.render("campgrounds/index", { campgrounds });
};

module.exports.createForm = async (_, response) => {
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
    const geoData = await geocoder
        .forwardGeocode({
            query: location,
            limit: 1,
        })
        .send();
    const campground = new Campground({ title, location, image, description, price });
    campground.geometry = geoData.body.features[0].geometry;
    campground.author = request.user._id;
    campground.images = request.files.map((f) => ({ url: f.path, filename: f.filename }));
    await campground.save();
    console.log(campground);
    request.flash("success", "You successfully added a campground");
    response.redirect(`/campgrounds/${campground._id}`);
};

module.exports.delete = async (request, response) => {
    const { id } = request.params;
    await Campground.findByIdAndDelete(id);
    response.redirect("/campgrounds");
};

module.exports.edit = async (request, response) => {
    const { id } = request.params;
    const { title, location, image, description, price } = request.body.campground;
    const campground = await Campground.findByIdAndUpdate(
        id,
        { title, location, image, description, price },
        { runValidators: true }
    );
    const images = request.files.map((f) => ({ url: f.path, filename: f.filename }));
    campground.images.push(...images);
    await campground.save();
    if (request.body.deleteImages) {
        for (let filename of request.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: request.body.deleteImages } } } });
    }
    request.flash("success", "You successfully updated a campground");
    response.redirect(`/campgrounds/${campground._id}`);
};
