const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/expressError");
const campgrounds = require("./routes/campgrounds");

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

app.use("/campgrounds", campgrounds);

app.get("/", (request, response) => {
    response.render("home");
});

app.all("*", (request, response, next) => {
    next(new ExpressError("Not Found", 404));
});

app.use((error, request, response, next) => {
    const { statusCode = 500, message = "Something went worng" } = error;
    response.status(statusCode).render("errors/mongoose", { error });
});

app.listen(3000, () => {
    console.log("Server on port 3000");
});
