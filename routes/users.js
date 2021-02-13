const express = require("express");
const router = express.Router({ mergeParams: true });
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const passport = require("passport");
const users = require("../controllers/users");

router.get("/register", users.registerForm);

router.post("/register", asyncErrorHandler(users.register));

router.get("/login", users.loginForm);

// Using passport for authentication
router.post("/login", passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), users.login);

router.get("/logout", users.logout);

module.exports = router;
