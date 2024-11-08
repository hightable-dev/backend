module.exports = function(req, res, next) {
    var user = req.user;

    // Check if the user is either an admin or a manager
    if (UserType(req) === roles.admin || UserType(req) === roles.manager) {
        return next(); // Allow access
    } else {
        // If user is neither an admin nor a manager, deny access
        return res.status(403).json({ 'message': 'You don\'t have permission to perform this action.' });
    }
};
