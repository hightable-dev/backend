/**
 * @author mohan <mohan@studioq.co.in>
 */

/* global _, ProfileManagers /sails */


module.exports = function create(request, response) {

    const post_request_data = request.body;
    const filtered_post_data = _.pick(post_request_data, ['username', 'first_name', 'last_name', 'email', 'phone', 'pincode', 'password', 'dob', 'gender', 'address', 'city', 'state']);
    const Insert_post_data = _.pick(post_request_data, ['username', 'first_name', 'last_name', 'email', 'phone', 'pincode', 'password', 'dob', 'address', 'city', 'state']);
    const {active} = UseDataService ;

    const input_attributes = [
        { name: 'username' },
        { name: 'first_name' },
        { name: 'last_name' },
        { name: 'email' },
        { name: 'city' },
        // Add more attributes as needed
    ];

    const filtered_post_keys = Object.keys(filtered_post_data);
    Insert_post_data.status = active;

    const sendResponse = (details) => {
        const _response_object = {
            message: 'Manager created successfully.',
            details: _.cloneDeep(details)
        };
        return response.ok(_response_object);
    };

    const createUser = async (post_data) => {
        try {
            // Check if the username (email) already exists

            const existingUser = await Users.findOne({ email: post_data.email });
            if (existingUser) {
                const _response_object = {
                    errors: [{ message: "Username (email) already exists." }],
                    count: 1
                };
                return response.badRequest(_response_object);
            }
            const user_input = {
                username: [post_data.email],
                email: post_data.email,
                password: post_data.password,
                last_checkin_via: 'web',
                types: roles.manager,
                status: active,
                last_active: new Date(),
                verified: true
            };

            const user = await Users.create(user_input);

            Insert_post_data.account = user.id;
            const profile = await ProfileManagers.create(Insert_post_data);

            sendResponse(profile);
        } catch (error) {
            throw (error);
        }
    };




    validateModel.validate(ProfileManagers, input_attributes, filtered_post_data, (valid, errors) => {
        if (valid) {
            if (filtered_post_keys.includes('email')) {
                filtered_post_data.email = filtered_post_data.email.toLowerCase();
            } else {
                filtered_post_data.email = null;
            }

            createUser(filtered_post_data);
        } else {
            const _response_object = {
                errors: errors,
                count: errors.length
            };
            return response.badRequest(_response_object);
        }
    });
};

