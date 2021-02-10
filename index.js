const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/expressError");
const campgrounds = require("./routes/campgrounds");
const reviews = require("./routes/reviews");
const session = require("express-session");
const flash = require("connect-flash");

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
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

const sessionConfig = {
    secret: "thishsouldbeabettersecret!",
    resave: false,
    saveUninitialized: true,
    cookie: {
        // These are the same
        // They late for a week
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true, // Only lets http requests access to cookies
        // Does not allow third party scripts
    },
};
app.use(session(sessionConfig));
app.use(flash());

app.use((request, response, next) => {
    response.locals.success = request.flash("success");
    response.locals.error = request.flash("error");
    next();
});

app.use("/campgrounds", campgrounds);
app.use("/campgrounds/:campgroundId/reviews", reviews);

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
