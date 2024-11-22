/**
 *
 * @author mohan<mohan@studioq.co.in>
 *
 */


/**
 * oauthBearer policy
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */

var passport = require('passport');

module.exports = function (req, res, next) {
    passport.authenticate(
        'bearer',
        // function (err, user, info) {
        function (err, user) {
            if (err) {
                return res.status(401).json({ message: 'Unauthorized! Invalid credentials!' });
            } else if (!user) {
                return res.status(403).json({ message: 'Forbidden Access! :: IP Logged' });
            } else {
                delete req.query.access_token;
                req.user = user;
                return next();
            }
        }
    )(req, res);
};
