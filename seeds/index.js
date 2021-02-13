const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDb = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: "6026a14ab29ef4250085aa0d",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)}, ${sample(places)}`,
            geometry: { type: 'Point', coordinates: [-8.4183, 41.5532] },
            images: [
                {
                    url:
                        "https://res.cloudinary.com/dhvsbgdjo/image/upload/v1613218410/YelpCamp/cb0kocmpvoq4xazebjos.jpg",
                    filename: "YelpCamp/cb0kocmpvoq4xazebjos",
                },
                {
                    url:
                        "https://res.cloudinary.com/dhvsbgdjo/image/upload/v1613218413/YelpCamp/nndvejijdauq7w8j2eee.jpg",
                    filename: "YelpCamp/nndvejijdauq7w8j2eee",
                },
            ],
            description:
                "Lorem ipsum dolor sit amet consectetur adipisicing elit. Magni hic minus quaerat blanditiis fuga cupiditate ea. Perferendis molestiae distinctio, explicabo, sit, est sint nostrum inventore beatae eius aut reiciendis quisquam!",
            price: price,
        });
        await camp.save();
        console.log(i);
    }
    console.log("Finished");
};

seedDb()
    .then((_) => mongoose.connection.close())
    .catch((_) => mongoose.connection.close());
