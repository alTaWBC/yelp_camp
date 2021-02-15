if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
    // Access variable with process.env.[variablename]
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/expressError");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");

const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const MongoDBStore = require("connect-mongo")(session);

const database_url = process.env.ATLAS || "mongodb://localhost:27017/yelp-camp";

mongoose.connect(database_url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
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
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize());

const secret = process.env.SECRET || "thishsouldbeabettersecret!";

const store = new MongoDBStore({
    url: database_url,
    secret,
    touchAfter: 24 * 60 * 60,
});

store.on("error", function (e) {
    console.log("Session Store Error", e);
});

const sessionConfig = {
    // Change cookie name
    store,
    name: "yelp-camp",
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        // These are the same
        // They late for a week
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        // ! Only works over https
        // secure: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true, // Only lets http requests access to cookies
        // Does not allow third party scripts
    },
};
app.use(session(sessionConfig));
app.use(flash());
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`,
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

//Needs to be after app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

// Set authentication method
passport.use(new LocalStrategy(User.authenticate()));
// Set serializing method
passport.serializeUser(User.serializeUser());
// Set deserializing method
passport.deserializeUser(User.deserializeUser());

app.use((request, response, next) => {
    response.locals.currentUser = request.user;
    response.locals.success = request.flash("success");
    response.locals.error = request.flash("error");
    next();
});

// How to use passport
app.get("/fakeUser", async (request, response) => {
    const user = User({ email: "colt@gmail.com", username: "colt" });
    const password = "colt";
    User.register(user, password);
    response.send(user);
});

app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.get("/", (_, response) => {
    response.render("home");
});

app.all("*", (_, __, next) => {
    next(new ExpressError("Not Found", 404));
});

app.use((error, _, response, __) => {
    const { statusCode = 500, message = "Something went wrong" } = error;
    response.status(statusCode).render("errors/mongoose", { error });
});

app.listen(3000, () => {
    console.log("Server on port 3000");
});
