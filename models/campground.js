const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

const CampgroundSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    images: [
        {
            url: {
                type: String,
                required: true,
            },
            filename: {
                type: String,
                required: true,
            },
        },
    ],
    description: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
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
