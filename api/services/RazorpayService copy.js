const Razorpay = require('razorpay');

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

// Export Razorpay instance and other necessary functions
module.exports = {
  instance,
  generateUniqueReceiptNumber,

  createAccount: async function (customer) {
    try {
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
