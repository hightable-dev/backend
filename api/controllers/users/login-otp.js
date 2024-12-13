const { generateToken } = require('../../../config/oauth2');

module.exports = function login(request, response) {
    const post_request_data = request.body;
    var _response_object = {};
    var filtered_post_data = _.pick(post_request_data, ['phone', 'is_signup', 'interests', 'first_name', 'user_type', 'otp_verify', 'client_id', 'client_secret']);
    var input_attributes = [
        { name: 'phone', number: true, mobile: true },
        { name: 'interests' },
        { name: 'first_name' },
        { name: 'user_type' },
        { name: 'client_id' },
        { name: 'client_secret' },
    ];
    const phoneNumber = filtered_post_data.phone;
    const createUsers = async (input_data) => {
        // let encrypted_phone = filtered_post_data.phone;
        let encrypted_phone = UseDataService.phoneCrypto.encryptPhone(filtered_post_data.phone);
         
        input_data.username = [encrypted_phone];
        input_data.phone = encrypted_phone;
        input_data.interests = filtered_post_data.interests;
        input_data.status = 1;
        input_data.types = 2;

        const client = {
            client_id: filtered_post_data.client_id,
            client_secret: filtered_post_data.client_secret
        };

        try {
            // Create the user
            const user = await Users.create(input_data).fetch();

            if (user) {
                input_data.account = user.id;
                input_data.phone = encrypted_phone;


                // Create profile member
                const profileMember = await ProfileMembers.create(input_data).fetch();

                if (profileMember) {
                    // Update the user's profile_members field
                    await Users.update({ id: user.id }, { profile_members: profileMember.id });
                    const { accessToken, refreshToken, additionalData } = await generateTokens(user, client);

                    // Tokens generated successfully
                    const { expires_in, types, signup } = additionalData;

                    const responseBody = {
                        access_token: accessToken,
                        refresh_token: refreshToken,
                        expires_in,
                        types,
                        signup
                    };

                    _response_object = responseBody;

                    response.ok(_response_object);
                     await UseDataService.profilePercentile(profileMember);

                    return;

                } else {
                    return response.serverError({ error: 'Profile member creation failed' });
                }
            } else {
                return response.serverError({ error: 'User creation failed' });
            }
        } catch (error) {
            return response.serverError({ error: 'Internal server error' });
        }
    };


    // function generateTokens(user, client, done) {
    //     // Call the generateToken function from your OAuth2 configuration file
    //     generateToken(user, client, done);
    // }

    function generateTokens(user, client) {
        return new Promise((resolve, reject) => {
            generateToken(user, client, (err, accessToken, refreshToken, additionalData) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({ accessToken, refreshToken, additionalData });
                }
            });
        });
    }

    // Verify user mobile no after create user
    const verifyOTPAndCreateUser = async (phone, otp_verify, filtered_post_data) => {

        if (typeof phone !== 'string') {
            _response_object.otp_details = " phone must be a string";
            return response.badRequest(_response_object);
        }

        try {
            if (!otp_verify) {
                /**
                 *  otp_verify is provided will send the otp again
                 *  Send OTP if OTP is not provided
                 * */
                const data = await new Promise((resolve, reject) => {
                    loginService.sendOTP(phone, (err, data) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(data);

                        }
                    });
                });

                if (data.status === "success") {
                    _response_object.otp_details = data;
                    return response.ok(_response_object);

                } else {
                    _response_object.otp_details= data;
                    return response.badRequest(_response_object);

                }
            }
            // Verify OTP if OTP is provided
            const data = await new Promise((resolve, reject) => {
                if (typeof otp_verify !== 'string') {
                    _response_object.otp_details = " phone must be a string";
                    return response.badRequest(_response_object);
                }
                loginService.verifyOTP(phone, otp_verify, (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
            });

            if (data.status === "success") {
                await createUsers(filtered_post_data);
            }
            else {
                _response_object.otp_details = data;
                return response.badRequest(_response_object);
            }
            // }
        } catch (error) {
            return response.serverError(_response_object);
        }
    };

    validateModel.validate(null, input_attributes, filtered_post_data, async function (valid, errors) {
        if (valid) {
            await loginService.findUser(filtered_post_data.phone, 'phone', function (err, user) {
                if(err){
                   throw err ;
                }
                const { is_signup } = filtered_post_data;
                if (is_signup) {
                    if (user) {
                        _response_object.errors = "Account already found";
                        _response_object.is_user_exist = true;
                        return response.badRequest(_response_object);
                    }
                    else {
                        verifyOTPAndCreateUser(phoneNumber, filtered_post_data.otp_verify, filtered_post_data);

                    }
                } else if (!is_signup) {

                    if (user) {
                        verifyOTPAndCreateUser(phoneNumber, filtered_post_data.otp_verify, filtered_post_data);

                    } else {
                        _response_object.errors = "No account found";
                        _response_object.is_user_exist = false;
                        return response.badRequest(_response_object);

                    }
                }
            });
        } else {
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.badRequest(_response_object);
        }
    });
}