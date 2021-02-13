const express = require("express");
const router = express.Router({ mergeParams: true });
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const passport = require("passport");
const users = require("../controllers/users");

router.route("/register").get(users.registerForm).post(asyncErrorHandler(users.register));

router
    .route("/login")
    .get(users.loginForm)
    .post(passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), users.login);

router.get("/logout", users.logout);

module.exports = router;
