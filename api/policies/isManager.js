module.exports = function (req, res, next) {

    if (UserType(req) === roles.manager) {
        return next(); // Allow access
    } else {
        // If user's type is not 0, deny access
        res.status(403).json({ 'message': 'You don\'t have permission to perform this action.' });
    }
};
