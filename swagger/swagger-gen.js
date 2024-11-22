// swagger-gen.js

/**
 * Generates a Swagger endpoint definition for an API.
 * 
 * @module swagger-gen
 */

/**
 * Generates a Swagger endpoint object based on the provided parameters.
 * 
 * @param {Object} obj - The object containing endpoint configuration.
 * @param {string} obj.key - The key representing the endpoint in the generated Swagger document.
 * @param {string} obj.Tags - The tags associated with the endpoint for documentation purposes.
 * @param {string} obj.Description - A brief description of the endpoint's purpose.
 * @param {Object|Array} obj.data - The data structure for which the schema will be generated.
 * 
 * @returns {Object} The Swagger endpoint definition.
 * 
 * @example
 * const swaggerEndpoint = generateSwaggerEndpoint({
 *   key: 'getUser',
 *   Tags: 'User',
 *   Description: 'Retrieve user information',
 *   data: {
 *     id: 1,
 *     name: 'John Doe',
 *     email: 'john.doe@example.com',
 *   },
 * });
 */
function generateSwaggerEndpoint(obj) {
    const { key, Tags, Description, data } = obj;

    /**
     * Generates the schema for the given data object for Swagger documentation.
     * 
     * @param {Object|Array} data - The data structure to generate a schema for.
     * @returns {Object} The generated schema for the data.
     * 
     * @private
     */
    function generateSwaggerSchema(data) {
        const schema = {
            type: typeof data === 'object' && Array.isArray(data) ? 'array' : 'object',
            properties: {},
        };

        if (Array.isArray(data)) {
            if (data.length > 0) {
                schema.items = generateSwaggerSchema(data[0]);
            } else {
                schema.items = { type: 'object', properties: {} };
            }
        } else {
            for (const [key, value] of Object.entries(data)) {
                if (typeof value === 'object' && value !== null) {
                    if (Array.isArray(value)) {
                        schema.properties[key] = generateSwaggerSchema(value);
                    } else {
                        schema.properties[key] = generateSwaggerSchema(value);
                    }
                } else {
                    schema.properties[key] = {
                        type: typeof value,
                        example: value,
                    };
                }
            }
        }

        return schema;
    }

    return {
        [key]: {
            tags: [Tags],
            description: Description,
            responses: {
                '200': {
                    description: 'Successful response',
                    content: {
                        'application/json': {
                            schema: generateSwaggerSchema(data),
                        },
                    },
                },
            },
        },
    };
}

module.exports = { generateSwaggerEndpoint };
