var bcrypt = require('bcrypt'),
moment = require('moment'),
passport = require('passport'),
BearerStrategy = require('passport-http-bearer').Strategy,
BasicStrategy = require('passport-http').BasicStrategy,
LocalStrategy = require('passport-local').Strategy,
ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    Users.findOne({id: id}, function (err, user) {
        done(err, user);
    });
});

/**
 * LocalStrategy
 *
 * This strategy is used to authenticate users based on a username and password.
 * Anytime a request is made to authorize an application, we must ensure that
 * a user is logged in before asking them to approve the request.
 */
passport.use(new LocalStrategy( function (username, password, done) {
    process.nextTick(async function() {
        await loginService.findUser(username,'email', function(err, user){
            if (err) {
                return done(err);
            }
            if(!user) {
                return done(null, false, {message: 'Invalid username and password combination.'});
            }else{
                bcrypt.compare(password, user.password).then(function(password_check) {
                    if(!password_check){
                       return done({message: 'Invalid username or password combination ' }, false, { message: 'Invalid username or password combination'});
                    };
                    if(!user.verified){
                        return done({ message: 'Please verify your email.' }, false, { message: 'Please verify your email.' });
                    };
                    return done(null, user);
                });
            }
        });
    });
}));

/**
 * BasicStrategy & ClientPasswordStrategy
 *
 * These strategies are used to authenticate registered OAuth clients.  They are
 * employed to protect the `token` endpoint, which consumers use to obtain
 * access tokens.  The OAuth 2.0 specification suggests that clients use the
 * HTTP Basic scheme to authenticate.  Use of the client password strategy
 * allows clients to send the same credentials in the request body (as opposed
 * to the `Authorization` header).  While this approach is not recommended by
 * the specification, in practice it is quite common.
 */
passport.use(new BasicStrategy(
    async function (username, password, request_data, done) {
        if(request_data.login_type === 'otp' && !request_data.otp_session_id){
            return done(null, false, {message: 'otp_session_id is required.'});
        };
        await loginService.findUser(username,'phone', async function(err, user){
            if (err) {
                return done(err);
            }
            if(!user) {
                return done(null, false, {message: 'Invalid username and password combination.'});
            }else{
               await bcrypt.compare(password, user.password).then(function(password_check) {
                    if(!password_check){
                       return done({message: 'Invalid username or password combination'}, false, {message: 'Invalid username or password combination'});
                    };
                    if(!user.verified){
                        return done({ message: 'Please verify your email.' }, false, { message: 'Please verify your email.' });
                    };
                    return done(null, user);
                });
            }
        });
    }
));

passport.use(new ClientPasswordStrategy(
    function (client_id, client_secret, done) {
        Clients.findOne({
            client_id: client_id
        }, function (err, client) {
            if (err) {
                return done(err);
            }
            if(!client) {
                return done(null, false, {message: 'Unauthorized'});
            }
            if(client.client_secret !== client_secret) {
                return done({message: 'Unauthorized'}, false, {message: 'Unauthorized'});
            }
            return done(null, client);
        });
    }
));

/**
 * BearerStrategy
 *
 * This strategy is used to authenticate users based on an access token (aka a
 * bearer token).  The user must have previously authorized a client
 * application, which is issued an access token to make requests on behalf of
 * the authorizing user.
 */
passport.use(new BearerStrategy(
    async function (access_token, done) {
        await loginService.findUserByToken(access_token, async function(err, user){
            if (err) {
                return done(err);
            }
            if(!user) {
                return done(null, false);
            }else{
                var info = {scope: '*'};
                var now = moment().unix();
                var creation_date = moment(user.token.created_at).unix();
                if((now-creation_date) > sails.config.oauth.tokenLife){
                    await AccessTokens.destroy({token: access_token}, function (err) {
                       if (err){
                          return done(err);
                       }else{
                          return done({message: 'Token expired.'}, false, {message: 'Token expired.'});
                       }
                    });
                }else{
                    done(err, user, info);
                }
            }
        });
    }
));


/* =============================================================== */ 
const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_SECRET;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_ID;

passport.use(new LinkedInStrategy({
    clientID: LINKEDIN_CLIENT_ID,
    clientSecret: LINKEDIN_CLIENT_SECRET,
    callbackURL: "http://localhost:1337/login/linkedin/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // LinkedIn profile data is available here
    return done(null, profile);
  }
));

module.exports = {
  passport: passport
};
