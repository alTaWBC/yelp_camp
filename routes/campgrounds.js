const express = require("express");
const router = express.Router();
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const { isLoggedIn, validateCampground, isAuthor } = require("../middleware/middleware");
const campgrounds = require("../controllers/campgrounds");
const multer = require("multer");
// Node goes for index file automatically \|/
const { storage } = require("../cloudinary");
const upload = multer({ storage });

// GET
router
    .route("/")
    .get(asyncErrorHandler(campgrounds.index))
    .post(isLoggedIn, upload.array("image"), validateCampground, asyncErrorHandler(campgrounds.create));

router.get("/new", isLoggedIn, asyncErrorHandler(campgrounds.createForm));

router
    .route("/:id")
    .get(asyncErrorHandler(campgrounds.view))
    .delete(isLoggedIn, isAuthor, asyncErrorHandler(campgrounds.delete))
    .patch(isLoggedIn, isAuthor, validateCampground, asyncErrorHandler(campgrounds.edit));

router.get("/:id/edit", isLoggedIn, isAuthor, asyncErrorHandler(campgrounds.editForm));

// POST
router;

module.exports = router;
