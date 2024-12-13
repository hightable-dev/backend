/**
 *
 * @author mohan<mohan@studioq.co.in>
 *
 */

const oauth2orize = require('oauth2orize');
const  passport = require('passport');
const  bcrypt = require('bcrypt');
trustedClientPolicy = require('../api/policies/isTrustedClient.js');
SocialLoginPolicy = require('../api/policies/socialLoginPolicy.js');

// Create OAuth 2.0 server
const server = oauth2orize.createServer();

server.serializeClient(function (client, done) {
    return done(null, client.id);
});

server.deserializeClient(function (id, done) {
    Clients.findOne(id, function (err, client) {
        if (err) { return done(err); }
        return done(null, client);
    });
});

// Generate authorization code
server.grant(oauth2orize.grant.code(function (client, redirect_uri, user, ares, done) {
    AuthCodes.create({
        client_id: client.client_id,
        redirect_uri: redirect_uri,
        user_id: user.id,
        scope: ares.scope
    }).exec(function (err, code) {
        if (err) { return done(err, null); }
        return done(null, code.code);
    });
}));

// Generate access token for Implicit flow
// Only access token is generated in this flow, no refresh token is issued
server.grant(oauth2orize.grant.token(function (client, user, ares, done) {
    AccessTokens.destroy({ user_id: user.id, client_id: client.client_id }, function (err) {
        if (err) {
            return done(err);
        } else {
            AccessTokens.create({ user_id: user.id, client_id: client.client_id }, function (err, accessToken) {
                if (err) {
                    return done(err);
                } else {
                    return done(null, accessToken.token);
                }
            });
        }
    });
}));

// Exchange authorization code for access token
server.exchange(oauth2orize.exchange.code(function (client, code, redirect_uri, done) {
    AuthCodes.findOne({
        code: code
    }).exec(function (err, code) {
        if (err || !code) {
            return done(err);
        }
        if (client.client_id !== code.client_id) {
            return done(null, false);
        }
        if (redirect_uri !== code.redirect_uri) {
            return done(null, false);
        }
        RefreshTokens.create({ user_id: code.user_id, client_id: code.client_id }).exec(function (err, refreshToken) {

            if (err) {
                return done(err);
            } else {
                AccessTokens.create({ user_id: code.user_id, client_id: code.client_id }).exec(function (err, accessToken) {

                    if (err) {
                        return done(err);
                    } else {
                        Users.update({ id: user.id }, { last_active: new Date() }, function (err, updated_user) {
                    
                            return done(null, accessToken.token, refreshToken.token, { 'expires_in': sails.config.oauth.tokenLife });
                        });
                    }
                });
            }
        });
    });
}));

// Exchange username & password for access token.
server.exchange(oauth2orize.exchange.password(async function (client, username, password, scope, request_data, done) {
    // if (request_data.login_type === 'otp' && !request_data.otp_session_id) {
    //     return done({ message: 'otp_session_id is required.' }, false, { message: 'otp_session_id is required.' });
    // }
    await loginService.findUser(username, request_data.login_type, async function (err, user) {
        if (!user) {
            return done({ message: 'Invalid username or password combination. User not registered.' }, false, { message: 'Invalid username or password combination 102.' });
        } else if (user.status !== 1) {
            return done({ message: 'Your account has been deactived. Please contact admin for further details.' }, false, { message: 'Child account are not allowed to login.' });
        } else {
            if (request_data.login_type === 'phone') {
                try {
                    // Call the verifyOTP function with the correct parameters
                    const data = await new Promise((resolve, reject) => {
                        loginService.verifyOTP(username, password, (err, data) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(data);
                            }
                        });
                    });
            
                    if (data.status === "success") {
                        // Assuming user and client are defined somewhere
                        generateToken(user, client, done);
                    } else {
                        // Respond with failure status
                        return done(data)
                    }
                } catch (error) {
                    // Handle any errors
                    throw error;
                }
            }
            
            else {
                bcrypt.compare(password, user.password).then(function (password_check) {
                    if (!password_check) {
                        return done({ message: 'Invalid username or password combination.128' }, false, { message: 'Invalid username or password combination' });
                    };

                    generateToken(user, client, done);
                });
            }
        }
    });
    //Generating access token
    // function generateToken(user, client, done) {
    //     RefreshTokens.create({ user_id: user.id, client_id: client.client_id }, function (err, refreshToken) {
    //         if (err) {
    //             return done(err);
    //         } else {
    //             AccessTokens.create({ user_id: user.id, client_id: client.client_id }, function (err, accessToken) {
    //                 if (err) {
    //                     return done(err);
    //                 } else {
    //                     Users.update({ id: user.id }, { last_active: new Date() }, function (err, updated_user) {
    //                         done(null, accessToken.token, refreshToken.token, { 'expires_in': sails.config.oauth.tokenLife, types: [user.types], signup: true });
    //                     });
    //                 }
    //             });
    //         }
    //     });
    // }
}));

function generateToken(user, client, done) {
    RefreshTokens.create({ user_id: user.id, client_id: client.client_id }, function (err, refreshToken) {
        if (err) {
            return done(err);
        } else {
            AccessTokens.create({ user_id: user.id, client_id: client.client_id }, function (err, accessToken) {
                if (err) {
                    return done(err);
                } else {
                    Users.update({ id: user.id }, { last_active: new Date() }, function (err, updated_user) {
                        done(null, accessToken.token, refreshToken.token, { 'expires_in': sails.config.oauth.tokenLife, types: [user.types], signup: true });
                    });
                }
            });
        }
    });
}
// Exchange refreshToken for access token.
server.exchange(oauth2orize.exchange.refreshToken(function (client, refreshToken, done) {
    RefreshTokens.findOne({ token: refreshToken }, function (err, token) {
        if (err) { return done(err); }
        if (!token) { return done({ message: 'Unauthorized' }, false); }
        var query_params = {
            id: token.user_id
        };
        Users.findOne(query_params).exec(function (err, user_result) {
            if (err) { return done(err); }
            if (!user_result) {
                return done({ message: 'Unauthorized' }, false, { message: 'Unauthorized' });
            }
            else {
                destroyExistingTokens( function (err) {
                    if (err) {
                        return done(err);
                    } else {
                        generateRefreshToken(user_result, client);
                    }
                });
            }
        });
        //Destroying existing tokens
        function destroyExistingTokens( destroy_callback) {
            RefreshTokens.destroy({ token: refreshToken }, function (err) {
                if (err) {
                    return destroy_callback(err);
                } else {
                    return destroy_callback(err, true);
                }
            });
        };
        //Generating refresh token
        function generateRefreshToken(user, client) {
            RefreshTokens.create({ user_id: user.id, client_id: client.client_id }, function (err, refreshToken) {
                if (err) {
                    return done(err);
                } else {
                    AccessTokens.create({ user_id: user.id, client_id: client.client_id }, function (err, accessToken) {
                        if (err) {
                            return done(err);
                        } else {
                            Users.update({ id: user.id }, { last_active: new Date() }, function (err) {
                                if(err){
                                    return done(err);

                                }
                          
                                done(null, accessToken.token, refreshToken.token, { 'expires_in': sails.config.oauth.tokenLife, types: [user.types] });
                            });
                        }
                    });
                }
            });
        }
    });
}));

module.exports = {
    generateToken: generateToken,

    http: {
        middleware: {
            initializePassport: (function () {
                // var passport = require('passport');
                let reqResNextFn = passport.initialize();
                return reqResNextFn;
            })(),
            // passportSession : (function (){
            //     var passport = require('passport');
            //     var reqResNextFn = passport.session();
            //     return reqResNextFn;
            // })()
        }
    },
    server: server
};
