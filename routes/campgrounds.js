const express = require("express");
const router = express.Router();
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const { isLoggedIn, validateCampground, isAuthor } = require("../middleware/middleware");
const campgrounds = require("../controllers/campgrounds");

// GET
router.get("/", asyncErrorHandler(campgrounds.index));

router.get("/new", isLoggedIn, asyncErrorHandler(campgrounds.createForm));

router.get("/:id", asyncErrorHandler(campgrounds.view));

router.get("/:id/edit", isLoggedIn, isAuthor, asyncErrorHandler(campgrounds.editForm));

// POST
router.post("/", validateCampground, asyncErrorHandler(campgrounds.create));

// DELETE
router.delete("/:id", isLoggedIn, isAuthor, asyncErrorHandler(campgrounds.delete));

// PATCH
router.patch("/:id", isLoggedIn, isAuthor, validateCampground, asyncErrorHandler(campgrounds.edit));

module.exports = router;
