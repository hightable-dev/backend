module.exports = {
    createData: async (modelName, post_data, message, callback) => {
        try {
            // Create data using the provided model
            const data = await modelName.create(post_data).fetch();

            // If data is created successfully
            if (data) {
                data.message = message;
                // Call the callback with the created data
                callback(null, data);
            } else {
                // Handle case where no data is created
                const error = new Error('No data created.');
                callback(error, null);
            }
        } catch (err) {
            // Handle errors from the creation process
            console.error("Error creating data:", err);
            const error_obj = await errorBuilder.build(err);

            // Pass the error object to the callback
            callback({ errors: error_obj, count: error_obj.length }, null);
        }
    }

    
};
