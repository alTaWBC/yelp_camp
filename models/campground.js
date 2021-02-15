const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

const ImageSchema = new Schema({
    url: {
        type: String,
        required: true,
    },
    filename: {
        type: String,
        required: true,
    },
});

ImageSchema.virtual("thumbnail").get(function () {
    return this.url.replace("/upload", "/upload/w_200");
});

// How to include virtuals in Json stringify
const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        images: [ImageSchema],
        description: {
            type: String,
            required: true,
        },
        location: {
            type: String,
            required: true,
        },
        geometry: {
            type: {
                type: String,
                enum: ["Point"],
                required: true,
            },
            coordinates: {
                type: [Number],
                required: true,
            },
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        reviews: [
            {
                type: Schema.Types.ObjectId,
                ref: "Review",
            },
        ],
    },
    opts
);

// Nesting objects
CampgroundSchema.virtual("properties.popupMarkup").get(function () {
    return `<strong><a href='/campgrounds/${this._id}'>${this.title}</a></strong>
    <p>${this.description.substring(0, 30)}...</p>`;
});

CampgroundSchema.post("findOneAndDelete", async function (campground) {
    if (!campground) return;
    await Review.deleteMany({
        _id: {
            $in: campground.reviews,
        },
    });
});

module.exports = mongoose.model("Campground", CampgroundSchema);
