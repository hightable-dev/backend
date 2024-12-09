/**
 *
 * @author mohan<mohan@studioq.co.in>
 *
 */

/**
 * isTrustedClients policy
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */

module.exports = function (req, res, next) {
    var _response_object = {};
    const post_params = req.body;
    var grantType = post_params.grant_type;
    if (!grantType) {
        _response_object.message = 'grant_type field is missing.';
        return res.badRequest(_response_object);
    }
    else {
        // Handle password and authorization code grant type
        if (grantType === 'password') {
            // Make sure client_id is provided
            var client_id = post_params.client_id;
            if (!client_id) {
                _response_object.message = 'client_id field is missing.';
                return res.badRequest(_response_object);
            } else {
                // Make sure client is trusted
                Clients.findOne({ client_id: client_id }, function (err, client) {
                    if (err) {
                        return res.serverError(err.message);
                    }
                    else {
                        if (!client) {
                            _response_object.message = 'unauthorized client';
                            return res.status(401).json(_response_object);
                        }
                        if (client.trusted) {
                            return next();
                        } else {
                            _response_object.message = 'resource owner password flow is not allowed.';
                            return res.status(401).json(_response_object);
                        }
                    }
                });
            }
        } else if (grantType === 'refresh_token') {
            return next();
        }
        else if (grantType === 'authorization_code') {
            return next();
        }
        else {
            _response_object.message = 'Invalid grant type';
            return res.status(503).json(_response_object);
        }
    }

};
