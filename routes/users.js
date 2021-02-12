const express = require("express");
const router = express.Router({ mergeParams: true });
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const User = require("../models/user");
const passport = require("passport");

router.get("/register", (request, response) => {
    response.render("users/register");
});

router.post(
    "/register",
    asyncErrorHandler(async (request, response, next) => {
        try {
            const { email, username, password } = request.body;
            const user = new User({ email, username });
            const registeredUser = await User.register(user, password);
            request.login(registeredUser, (error) => {
                if (error) return next(error);
                request.flash("success", "Welcome to Yelp Camp");
                response.redirect("/campgrounds");
            });
        } catch (error) {
            request.flash("error", error.message);
            response.redirect("/register");
        }
    })
);

router.get("/login", (request, response) => {
    response.render("users/login");
});

// Using passport for authentication
router.post(
    "/login",
    passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }),
    (request, response) => {
        request.flash("success", "welcome back");
        const redirectUrl = request.session.returnTo || "/campgrounds";
        delete request.session.returnTo;
        response.redirect(redirectUrl);
    }
);

router.get("/logout", (request, response) => {
    request.logout();
    request.flash("success", "Goodbye!");
    response.redirect("/campgrounds");
});

module.exports = router;

/// username: william email: a@a.com password: william
