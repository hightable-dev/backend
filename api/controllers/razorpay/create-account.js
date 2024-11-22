const RazorpayService = require('../../services/RazorpayService');

module.exports = function update(request, response) {
    const { account_number, account_type, account_holder_name, IFSC_code } = request.body;

    const bankDetails = {account_number, account_type, account_holder_name, IFSC_code}

    const inputAttributes = [
        { name: 'account_number', required: true },
        { name: 'account_holder_name', required: true },
        { name: 'IFSC_code', required: true },
    ];
    let responseObject = {};
    // Define input attributes and perform validation
    validateModel.validate(null, inputAttributes, request.body, async function (valid, errors) {
        if (valid) {
            try {
                let getMemberDetails = await ProfileMembers.findOne({ id: ProfileMemberId(request) });
                // Assuming you have a phoneEncryptor module imported
                phoneEncryptor.decrypt(getMemberDetails.phone, (decryptedPhone) => {
                    getMemberDetails.phone = decryptedPhone;
                });
                const { first_name, last_name, email, phone, street, address, city, state, postal_code } = getMemberDetails;
                // Construct customer object for Razorpay
                const customer = {
                    email,
                    phone,
                    type: 'route',
                    legal_business_name: 'High table',
                    business_type: 'not_yet_registered',
                    contact_name: `${first_name} ${last_name}`,
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
                };

                // Create account in Razorpay
                const accountCreate = await RazorpayService.createAccount(customer);
                const linked_account_id = accountCreate.id;

                // Create product request in Razorpay
                const productRequest = await RazorpayService.createProductRequest(linked_account_id);
                const linked_product_id = productRequest.id;

                // Update product request in Razorpay
                const productUpdate = await RazorpayService.updateProductRequest(linked_account_id, linked_product_id, bankDetails);

                // Update ProfileMembers with linked account and product IDs
                const profileMemberBankDetails = await ProfileMembers.updateOne({ id: ProfileMemberId(request) }, { linked_account_id, linked_product_id });

                return response.status(200).json({ message: "Account details updated successfully", profileMemberBankDetails, productUpdate });
            } catch (error) {
                return response.status(500).json(error);
            }
        } else {
            responseObject = {
                errors: errors,
                count: errors.length
            };
            return response.status(400).json(responseObject);
        }
    });
};
