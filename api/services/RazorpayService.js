const Razorpay = require('razorpay');
const axios = require('axios');

// Initialize Razorpay instance with your API keys
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Function to generate a unique receipt number
function generateUniqueReceiptNumber(paymentId) {
  // Implement your logic to generate a unique receipt number
  // For demonstration purposes, I'll generate a unique timestamp-based receipt number
  return `Receipt-${paymentId}${Date.now()}`;
}

const transfersUrl = 'https://api.razorpay.com/v1/transfers';
const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

async function createTransfer(amount, currency, account, notes) {
  try {
    // Set up request body with transfer data
    const transferData = {
      amount: amount,
      currency: currency,
      account: account,
      notes: notes
    };

    // Set up request headers with Razorpay API key
    const headers = {
      'Authorization': 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64'),
      'Content-Type': 'application/json'
    };

    // Make POST request to Razorpay transfers endpoint
    const response = await axios.post(transfersUrl, transferData, { headers });

    // Return the created transfer data
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
}

async function createRazorpayOrder(amount, title) {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });

  const options = {
    amount: amount * 100, // Amount in paise
    currency: 'INR',
    receipt: title,
    payment_capture: 1 // Auto capture
  };
  const test = await razorpay.orders.create(options)

  return await razorpay.orders.create(options);
}

// Export Razorpay instance and other necessary functions
module.exports = {
  instance,
  generateUniqueReceiptNumber,
  createTransfer,
  createRazorpayOrder,

  createAccount: async function (customer) {
    try {
      /** These details are required 
       *  const customer = {
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
       *
       * 
       */
      const accountCreate = await instance.accounts.create(customer);


      return accountCreate;
    } catch (error) {
      throw error;
    }
  },

  createProductRequest: async function (accountId) {
    try {
      const productRequest = await instance.products.requestProductConfiguration(accountId, {
        product_name: 'route',
        tnc_accepted: true
      });
      return productRequest;
    } catch (error) {
      throw error;
    }
  },

  updateProductRequest: async function (accountId, productId, customer) {
    try {
      const productRequest = await instance.products.edit(accountId, productId, {
        settlements: {
          account_number: customer.account_number,
          ifsc_code: customer.IFSC_code,
          beneficiary_name: customer.account_holder_name
        },
        tnc_accepted: true
      });
      return productRequest;
    } catch (error) {
      throw error;
    }
  }
};
