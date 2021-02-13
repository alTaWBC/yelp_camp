const User = require("../models/user");


const RedirectRequest = (path) => {
    if (!path) return "/campgrounds";
    const id = path.split("/")[2];
    return `/campgrounds/${id}`;
};

module.exports.registerForm = (_, response) => {
    response.render("users/register");
};
module.exports.register = async (request, response, next) => {
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
};
module.exports.loginForm = (_, response) => {
    response.render("users/login");
};
module.exports.login = (request, response) => {
    const redirectUrl = RedirectRequest(request.session.returnTo);
    delete request.session.returnTo;
    response.redirect(redirectUrl);
};
module.exports.logout = (request, response) => {
    request.logout();
    request.flash("success", "Goodbye!");
    response.redirect("/campgrounds");
};
