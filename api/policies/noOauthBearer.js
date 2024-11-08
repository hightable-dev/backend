/**
 *
 * @author mohan<mohan@studioq.co.in>
 *
 */


/**
 * noOauthBearer policy
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */

var passport = require('passport');

module.exports = async function (req, res, next) {
    if (req.query.access_token && req.query.access_token !== '') {
        passport.authenticate(
            'bearer',
            function (err, user, info) {
                if ((err) || (!user)) {
                    res.sendStatus(401);
                    // res.redirect('/');
                    return;
                }
                delete req.query.access_token;
                req.user = user;
                return next();
            }
        )(req, res);
    }
    else {
        return next();
    }

};
