/* global _, Social Logins sails */
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
// Import necessary modules for LinkedIn API calls
const { RestliClient } = require('linkedin-api-client');
// const LinkedInService = require('./linkedInService');
// const linkedInRestliClient = new RestliClient();
const LinkedInService = require('../services/linkedInService'); // Adjust the path as needed
const linkedInService = new LinkedInService();

module.exports = function signupSocial(request, response) {
    try {
        const post_request_data = request.body;

        var _response_object = {};
        var filtered_post_data = _.pick(post_request_data, ['type', 'token', 'source_type', 'data', 'interests','is_signup','first_name','last_name']);
        const filtered_post_keys = Object.keys(filtered_post_data);
        const client = request.user;
        var input_attributes = [
            { name: 'type', enum: true, values: ['facebook', 'linkedin', 'google','apple'] },
            { name: 'token', required: true },
            { name: 'interests' },
        ];

        const findExistingSocialUser = async function (type, id, callback) {
            try {
                const user = await Users.find({ [`${type}_id`]: id }).limit(1);
                if (user && user.length > 0) {
                    return callback(null, user[0]);
                } else {
                    return callback(null, null);
                }
            } catch (error) {

                return callback(error);
            }
        };

        const createUser = async (post_data, callback) => {
            const type = filtered_post_data.type;

            var user_input = {
                user_role: 1,
                last_active: new Date(),
                last_checkin_via: type,
                status: "1",
                interests: post_data.interests,
                types: 2,

            };
            if (type == "facebook") {
                user_input.username = [type + '_' + post_data.facebook_id];
                user_input.facebook_id = post_data.facebook_id;
                user_input.facebook_data = post_data;
            }

            if (type == "apple") {
                user_input.username = [type + '_' + post_data.apple_id];
                user_input.apple_id = type + '_' + post_data.apple_id;
                user_input.status = "1";



            } else if (type == "google") {
                user_input.username = [type + '_' + post_data.google_id];
                user_input.google_id = post_data.google_id;
                user_input.google_data = post_data;

            }


            // Integrate LinkedIn authentication
            if (type === 'linkedin') {
                user_input.username = [type + '_' + post_data.linkedin_id];
                user_input.linkedin_id = post_data.linkedin_id;
                user_input.linkedin_data = post_data;
            }


            user_input.password = Math.floor(10000000 + Math.random() * 90000000);
            if (post_data.email) {
                user_input.email = post_data.email.toLowerCase();
            }
            if (post_data.phone) {
                user_input.phone = post_data.encrypted_phone;
            }
            if (post_data.first_name) {
                user_input.first_name = post_data.first_name;
            }
            if (post_data.last_name) {
                user_input.last_name = post_data.last_name;
            }
            if (post_data.interests) {
                user_input.interests = post_data.interests;
            }
            if (post_data.email) {
                user_input.handle = post_data.email;
            } else if (post_data.phone) {
                user_input.handle = post_data.phone;
            }

            Users.create(user_input, async function (err, user) {
                if (err) {
                    await errorBuilder.build(err, function (error_obj) {
                        _response_object.errors = error_obj;
                        _response_object.count = error_obj.length;
                        return response.status(500).json(_response_object);
                    });
                } else {
                    // After creating the user, insert static data into ProfileMembers
                    user_input.account = user.id; // Assigning user_id to account
                    await ProfileMembers.create(user_input, async function (err, profileMember) {
                        if (err) {
                            await handleCreateError(err, response);
                            reject(err);
                        } else {
                            // Update the profile member id in Users table where column is profile_members
                            Users.updateOne({ id: user.id }, { profile_members: profileMember.id }, async function (err, updatedUser) {
                                
                                if (err) {
                                    reject(err);
                                } else {
                                    generateToken(updatedUser);
                                }
                            });
                        }
                    });
                }
            });

        };

        const updateUser = (user_data, post_data, callback) => {
            const type = filtered_post_data.type;
            var profile_input = {};
            profile_input[type + '_id'] = post_data.id;
            profile_input[type + '_data'] = post_data;
            Users.update({ id: parseInt(user_data.id) }, profile_input, function (err, updated_user) {
                generateToken(Array.isArray(updated_user) && updated_user?.length ? updated_user[0] : updated_user);
            });
        };

        const signup = async (post_data) => {
            const type = filtered_post_data.type;

            let socialId;

            switch (type) {

                case "facebook":
                    socialId = post_data.facebook_id;
                    break;
                case "linkedin":
                    socialId = post_data.linkedin_id;
                    break;
                case "google":
                    socialId = post_data.google_id;
                    break;
                case "apple":
                    socialId = post_data.apple_id;
                    break;
                default:
                    null;
                // Handle unknown type
            }
            await findExistingSocialUser(type, socialId, async function (err, user) {
                if (err) {
                    await errorBuilder.build(err, function (error_obj) {
                        _response_object.errors = error_obj;
                        _response_object.count = error_obj.length;
                        return response.status(500).json(_response_object);
                    });
                } else if (user) {
                    if (!filtered_post_data.is_signup) {
                        updateUser(user, post_data);
                    } else {
                        _response_object.errors = { message: 'You account already exist please try login to access the account' };
                        return response.status(500).json(_response_object);
                    }   
                } else {
                    let email = post_data.email ? post_data.email : null;
                    let phone = null;

                    if (post_data.phone) {
                        phone = post_data.phone;
                        await phoneEncryptor.encrypt(filtered_post_data.phone, function (encrypted_text) {
                            post_data.encrypted_phone = encrypted_text;
                        });
                    }

                    if (_.isNull(email) && _.isNull(phone)) {
                    if (filtered_post_data.is_signup) {
                        createUser(post_data);
                    } else {
                        _response_object.errors = { message: 'You don\'t have account to login' };
                        return response.status(500).json(_response_object);
                    }
                      
                    } else {
                        await loginService.findExistingConnection(0, email, phone, async function (err, user) {
                            if (err) {
                                await errorBuilder.build(err, function (error_obj) {
                                    _response_object.errors = error_obj;
                                    _response_object.count = error_obj.length;
                                    return response.status(500).json(_response_object);
                                });
                            } else if (user) {
                    if (!filtered_post_data.is_signup) {
                        updateUser(user, post_data);
                    } else {
                        _response_object.errors = { message: 'You account already exist please try login to access the account' };
                        return response.status(500).json(_response_object);
                    }  
                                
                            } else {
                    if (filtered_post_data.is_signup) {
                        createUser(post_data);
                    } else {
                        _response_object.errors = { message: 'You don\'t have account to login' };
                        return response.status(500).json(_response_object);
                    }
                                
                            }
                        });
                    }
                }
            });
        };

        const generateToken = async (user) => {
            RefreshTokens.create({ user_id: user.id, client_id: client.client_id }, function (err, refresh_token) {

                if (err) {
                    _response_object.message = 'Something wrong in generating refresh_token.';
                    return response.status(500).json(_response_object);
                } else {
                    AccessTokens.create({ user_id: user.id, client_id: client.client_id }, function (err, access_token) {
                        if (err) {
                            _response_object.message = 'Something wrong in generating access_token.';
                            return response.status(500).json(_response_object);
                        } else {
                            _response_object.access_token = access_token.token;
                            _response_object.refresh_token = refresh_token.token;
                            _response_object.expires_in = sails.config.oauth.tokenLife;
                            _response_object.token_type = "Bearer";
                            return response.status(200).json(_response_object);
                        }
                    });
                }
            });
        };

        validateModel.validate(Users, input_attributes, filtered_post_data, async function (valid, errors) {

            if (valid) {
                const type = filtered_post_data.type;
                const token = filtered_post_data.token;
                if (type === 'facebook') {
                    var FB = require('fb');
                    FB.api('me', { fields: ['id', 'email', 'first_name', 'last_name', 'picture.width(800).height(800)'], access_token: token }, function (facebook_response) {
                        if (facebook_response.error) {
                            _response_object.message = facebook_response.error.message;
                            return response.status(401).json(_response_object);
                        } else {
                            let data = facebook_response;
                            var content = {
                                facebook_id: data.id,
                                first_name: data.first_name,
                                last_name: data.last_name,
                                email: data.email,
                                interests: filtered_post_data.interests,

                            };
                            signup(content);
                        }
                    });

                }
             
                if (type === 'linkedin') {
                    try {
                        const profileData = await linkedInService.fetchMemberProfile(token);
                        var content = {
                            linkedin_id: profileData.sub,
                            first_name: profileData.given_name,
                            last_name: profileData.family_name,
                            email: profileData.email,
                            interests: filtered_post_data.interests
                        };

                        signup(content);
                    } catch (error) {
                        console.error('Error fetching LinkedIn profile:', error);
                        _response_object = {
                            error: 'Failed to fetch LinkedIn profile',
                            details: error
                        }

                        // return response.serverError('Failed to fetch LinkedIn profile');
                        return response.serverError(_response_object);
                    }
                }


                if (type === 'google') {
                    const { OAuth2Client } = require('google-auth-library');
                    var google_client = new OAuth2Client(sails.config.conf.google_client_id, '', '');
                    google_client.verifyIdToken({ idToken: token }, function (google_error, login) {

                        if (google_error) {
                            _response_object.message = google_error.toString();
                            return response.status(401).json(_response_object);
                        } else {
                            var data = login.getPayload();
                            if (data.email_verified) {
                                var content = {
                                    google_id: data.sub,
                                    first_name: data.given_name
                                };
                                if (data.family_name) {
                                    content.last_name = data.family_name;
                                }
                                if (data.email) {
                                    content.email = data.email;
                                }
                                signup(content);
                            } else {
                                _response_object.message = 'Email not verified with google.';
                                return response.status(400).json(_response_object);;
                            }
                        }
                    });
                }  
                if(type==='apple'){
                    const appleIdToken = token;
                    const client = jwksClient({
                        jwksUri: 'https://appleid.apple.com/auth/keys',
                    });
                    // Function to verify the Apple ID token
                    function verifyAppleIdToken(token) {
                        return new Promise((resolve, reject) => {
                            jwt.verify(token, (header, callback) => {
                                client.getSigningKey(header.kid, (err, key) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        const publicKey = key.getPublicKey();
                                        callback(null, publicKey);
                                    }
                                });
                            }, { algorithms: ['RS256'] }, (err, decodedToken) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(decodedToken);
                                }
                            });
                        });
                    }

                    // Verify the Apple ID token
                    verifyAppleIdToken(appleIdToken)
                        .then((decodedToken) => {
                            // Token verification successful
                            let data = filtered_post_keys.includes('data') ? filtered_post_data.data : decodedToken;
                           
                            console.log("data data",data);
                            var content = {
                                apple_id: decodedToken.sub
                            };
                            if (filtered_post_data?.first_name) {
                                content.first_name = filtered_post_data?.first_name;
                            }
                            if (filtered_post_data?.last_name) {
                                content.last_name = filtered_post_data?.last_name;
                            }
                            if (decodedToken.email) {
                                content.email = decodedToken.email;
                            }

                            signup(content);
                        })
                        .catch((err) => {
                            // Token verification failed
                            console.error('Token verification failed:', err);
                        });
                
                }  
            }
            else {
                _response_object.errors = errors;
                _response_object.count = errors.length;
                return response.status(400).json(_response_object);
            }
        });
    } catch (err) {
        _response_object.message = 'Something went wrong.';
        return response.status(500).json(_response_object);
    }
};
