module.exports = (asyncFunction) => {
    return (request, response, next) => {
        asyncFunction(request, response, next).catch(next);
    };
};
