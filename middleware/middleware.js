module.exports.isLoggedIn = (request, response, next) => {
    if (!request.isAuthenticated()) {
        request.session.returnTo = request.originalUrl;
        request.flash("error", "You must be signed in");
        return response.redirect("/login");
    }
    next();
};
