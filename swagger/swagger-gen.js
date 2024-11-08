// swagger-gen.js

function generateSwaggerEndpoint(obj) {
    const { key, Tags, Description, data } = obj;

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
