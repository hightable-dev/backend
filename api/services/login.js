/* global _, Social Logins sails */
// const jwt = require('jsonwebtoken');
// const jwksClient = require('jwks-rsa');
// const { RestliClient } = require('linkedin-api-client');
// const linkedInRestliClient = new RestliClient();
const LinkedInService = require('../services/linkedInService'); // Adjust the path as needed
const linkedInService = new LinkedInService();

module.exports = function signupSocial(request, response) {
    try {
        const post_request_data = request.body;

        let _response_object = {};
        const filtered_post_data = _.pick(post_request_data, ['type', 'token', 'source_type', 'data', 'interests']);
        // const filtered_post_keys = Object.keys(filtered_post_data);
        const client = request.user;
        const input_attributes = [
            { name: 'type', enum: true, values: ['facebook', 'linkedin'] },
            { name: 'token', required: true },
            { name: 'interests', required: true },
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

        const createUser = async (post_data) => {
            const type = filtered_post_data.type;
            var user_input = {
                user_role: 1,
                last_active: new Date(),
                last_checkin_via: type,
                status: "1",
                interests: post_data.interests,
                types: 2,

            };
            if (type === "facebook") {
                user_input.username = [type + '_' + post_data.facebook_id];
                user_input.facebook_id = post_data.facebook_id;
                user_input.facebook_data = post_data;

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
                user_input.email = post_data.email;
                // user_input.handle = post_data.email; //typo handle to email changed
            } else if (post_data.phone) {
                user_input.phone = post_data.phone;
                // user_input.handle = post_data.phone; // typo handle to phone changed 
            }

            await Users.create(user_input, async function (err, user) {
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

                            await Users.update({ id: user_input.id }, { profile_members: profileMember.id }, async function (err) {
                                if (err) {
                                    return reject(err); // Return to avoid further execution
                                }
                                try {
                                    const token = await generateToken(profileMember);
                                    return token; // You might want to return or do something with the token
                                } catch (tokenError) {
                                    reject(tokenError); // Handle errors from generateToken
                                }
                            });

                        }
                    });
                }
            });

        };

        const updateUser = async (user_data, post_data) => {
            const type = filtered_post_data.type;
            const profile_input = {};
            profile_input[type + '_id'] = post_data.id;
            profile_input[type + '_data'] = post_data;
            await Users.update({ id: parseInt(user_data.id) }, profile_input, function (err, updated_user) {
                if(err){
                    // err defined not used just handled with error
                    console.error("Update User error")
                }
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
                default:
                    return response.status(400).json({
                        message: `Unsupported signup type: ${type}`
                    });
            }
            await findExistingSocialUser(type, socialId, async function (err, user) {
                if (err) {
                    await errorBuilder.build(err, function (error_obj) {
                        _response_object.errors = error_obj;
                        _response_object.count = error_obj.length;
                        return response.status(500).json(_response_object);
                    });
                } else if (user) {
                    updateUser(user, post_data);
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
                         createUser(post_data);
                    } else {
                        await loginService.findExistingConnection(0, email, phone, async function (err, user) {
                            if (err) {
                                await errorBuilder.build(err, function (error_obj) {
                                    _response_object.errors = error_obj;
                                    _response_object.count = error_obj.length;
                                    return response.status(500).json(_response_object);
                                });
                            } else if (user) {
                                updateUser(user, post_data);
                            } else {
                                createUser(post_data);
                            }
                        });
                    }
                }
            });
        };

        const generateToken = (user) => {
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
                            _response_object = { 
                                access_token: access_token.token,
                                refresh_token: refresh_token.token,
                                expires_in: sails.config.oauth.tokenLife,
                                token_type: "Bearer"
                            }
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
                    const FB = require('fb');
                    FB.api('me', { fields: ['id', 'email', 'first_name', 'last_name', 'picture.width(800).height(800)'], access_token: token }, function (facebook_response) {
                        if (facebook_response.error) {
                            _response_object.message = facebook_response.error.message;
                            return response.status(401).json(_response_object);
                        } else {
                            let data = facebook_response;
                            const content = {
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
                        const content = {
                            linkedin_id: profileData.sub,
                            first_name: profileData.given_name,
                            last_name: profileData.family_name,
                            email: profileData.email,
                            interests: filtered_post_data.interests
                        };

                        signup(content);
                    } catch (error) {
                        console.error('Error fetching LinkedIn profile:', error);
                        return response.serverError({ Error: 'Failed to fetch LinkedIn profile', details: error });
                    }
                }
            }
            else {
                _response_object = {
                    errors:  errors,
                    count:  errors.length,
                }
                return response.status(400).json(_response_object);
            }
        });
    } catch (err) {
        _response_object.message = 'Something went wrong.';
        return response.status(500).json(_response_object);
    }
};
