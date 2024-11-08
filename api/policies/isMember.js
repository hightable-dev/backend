/**
 *
 * @author sabarinathan <sabarinathan@studioq.co.in>
 *
 */


/* global Users, _ */

/**
 * isAdmin
 *
 * @description :: Policy to check whether the user is isAdmin
*/


module.exports = function (req, res, next) {
    if (UserType(req) === roles.member) {
        return next(); // Allow access
    } else {
        // If user's type is not 0, deny access
        res.status(403).json({ 'message': 'You don\'t have permission to perform this action.' });
    }
};
