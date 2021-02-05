const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const Campground = require("./models/campground");
const ejsMate = require("ejs-mate");
const asyncErrorHandler = require("./utils/asyncErrorHandler");
const ExpressError = require("./utils/expressError");

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

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.get("/", (request, response) => {
    response.render("home");
});

app.get(
    "/campgrounds",
    asyncErrorHandler(async (request, response) => {
        const campgrounds = await Campground.find({});
        response.render("campgrounds/index", { campgrounds });
    })
);

app.get(
    "/campgrounds/new",
    asyncErrorHandler(async (request, response) => {
        response.render("campgrounds/new");
    })
);

app.get(
    "/campgrounds/:id",
    asyncErrorHandler(async (request, response) => {
        const { id } = request.params;
        const campground = await Campground.findById(id);
        response.render("campgrounds/show", { campground });
    })
);

app.get(
    "/campgrounds/:id/edit",
    asyncErrorHandler(async (request, response) => {
        const { id } = request.params;
        const campground = await Campground.findById(id);
        response.render("campgrounds/edit", { campground });
    })
);

app.post(
    "/campgrounds",
    asyncErrorHandler(async (request, response, next) => {
        const { title, location, image, description, price } = request.body.campground; // Use like this if in ejs we did campground[field]
        console.log(title);
        if (!title || !location || !image || !description || !price)
            throw new ExpressError("Invalid Campground Data", 400);
        const campground = new Campground({ title, location, image, description, price }, { runValidators: true });
        await campground.save();
        response.redirect(`/campgrounds/${campground._id}`);
    })
);

app.patch(
    "/campgrounds/:id",
    asyncErrorHandler(async (request, response, next) => {
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

app.delete(
    "/campgrounds/:id",
    asyncErrorHandler(async (request, response) => {
        const { id } = request.params;
        await Campground.findByIdAndRemove(id);
        response.redirect("/campgrounds");
    })
);

app.all("*", (request, response, next) => {
    next(new ExpressError("Not Found", 404));
});

app.use((error, request, response, next) => {
    const { statusCode = 500, message = "Something went worng" } = error;
    response.status(statusCode).send(message);
});

app.listen(3000, () => {
    console.log("Server on port 3000");
});
