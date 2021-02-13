const express = require("express");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const { isLoggedIn, validateReview, isReviewAuthor } = require("../middleware/middleware");
const reviews = require("../controllers/reviews");

// Use this line to have access all parameters
// { mergeParams: true }
// when using routers
const router = express.Router({ mergeParams: true });

router.post("/", isLoggedIn, validateReview, asyncErrorHandler(reviews.create));

router.delete("/:reviewId", isLoggedIn, isReviewAuthor, asyncErrorHandler(reviews.delete));

module.exports = router;
