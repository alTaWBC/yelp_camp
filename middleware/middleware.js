module.exports.isLoggedIn = (request, response, next) => {
    
    if (!request.isAuthenticated()) {
        request.flash("error", "You must be signed in");
        return response.redirect("/login");
    }
    next();
};
