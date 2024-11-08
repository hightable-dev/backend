const RazorpayService = require('../../services/RazorpayService'); // Assuming you have a separate Razorpay service file
const _ = require('lodash');
// const validateModel = require('./validateModel'); // Assuming you have a validation module

module.exports = async function update(request, response) {
    //Dont remove this 
    const { account_number, account_type, account_holder_name, ifsc_code } = request.body;

    input_attributes = [
        { name: 'account_number', required: true },
        { name: 'account_type', required: true },
        { name: 'account_holder_name', required: true },
        { name: 'ifsc_code', required: true },
     
    ];
    // Define input attributes and perform validation

    validateModel.validate(null, input_attributes, request.body, async function (valid, errors) {
        let cusDetails = await ProfileMembers.findOne({ id: ProfileMemberId(request) });

        phoneEncryptor.decrypt(cusDetails.phone, (decryptedPhone) => {
            cusDetails.phone = decryptedPhone ;
        });

        const { first_name, last_name, email, phone, street, address, city, state, postal_code, } = cusDetails;

        if (!cusDetails) {
            return response.status(400).json({ error: 'User not found' });
        }

        if (valid) { // Assuming validation is successful
            try {

                // Your existing logic for employee contact retrieval goes here
                const customer = {
                    email,
                    phone,
                    type: 'route',
                    legal_business_name: 'High table',
                    business_type: 'not_yet_registered',
                    contact_name: first_name + ' ' + last_name,
                    profile: {
                        category: 'others',
                        subcategory: 'others',
                        addresses: {
                            registered: {
                                street1: street,
                                street2: address,
                                city,
                                state,
                                postal_code,
                                country: 'IN'
                            }
                        }
                    }
                }; // Placeholder for employee contact
                // Call account creation function from Razorpay service
                const accountCreate = await RazorpayService.createAccount(customer);
                const linked_account_id = accountCreate.id;
                // lodata("customer",customer)

                // Call product request creation function from Razorpay service
                const productRequest = await RazorpayService.createProductRequest(linked_account_id);
                const linked_product_id = productRequest.id;

                const profileMemberBankDetails = await ProfileMembers.update({ id: ProfileMemberId(request)},{ linked_account_id, linked_product_id });

                if(profileMemberBankDetails) {
                    return response.status(200).json({ message: 'Bank details updated', profileMemberBankDetails});
                }

                // Call product request update function from Razorpay service
                const productUpdate = await RazorpayService.updateProductRequest(linked_account_id, linked_product_id, request.body);

                return response.json(productUpdate);
            } catch (error) {
                return response.status(500).json(error);
            }
        } else {
            const responseObject = {
                errors: errors,
                count: errors.length
            };
            return response.status(400).json(responseObject);
        }
    });
};
