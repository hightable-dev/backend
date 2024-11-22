
const fs = require('fs');
const path = require('path');

// Define paths
const swaggerIndex = path.join(__dirname, '../../swagger/docs', 'index.js');
const routesPath = path.join(__dirname, '../../config/routes.js');
const swaggerDir = path.dirname(swaggerIndex);
const targetFile = path.resolve(__dirname, '../../config/routes.js');



/**
 * Create the swagger index file if it does not already exist.
 */
const createSwaggerIndexFile = () => {
    // Ensure the directory exists
    if (!fs.existsSync(swaggerDir)) {
        fs.mkdirSync(swaggerDir, { recursive: true });
    }

    // Create the swagger index file
    if (!fs.existsSync(swaggerIndex)) {
        const content = `
let swaggerRefs = [

];
module.exports = {
    swaggerRefs,
};\n`;
        try {
            fs.writeFileSync(swaggerIndex, content, 'utf8');

            // Ensure the require statement is added to the target file
            ensureSwaggerDocsRequire(targetFile, '../swagger/docs/index.js');

        } catch (err) {
            console.error('Error creating file:', err);
        }
    } else {
        // Ensure the require statement is added to the target file if it already exists
        ensureSwaggerDocsRequire(targetFile, '../swagger/docs/index.js');
    }
};
const { swaggerRefs } = require('../../swagger/docs');

const updateRouteWithSwaggerReference =  (actionValue, swaggerVariable) => {
    let routesContent;
    try {
        routesContent =  fs.readFileSync(routesPath, 'utf8');
    } catch (err) {
        console.error('Error reading routes.js:', err);
        return;
    }

    // Define a regex to match the route object with the specified action
    // const actionPath = `action: '${actionValue}'`;
    const routeRegex = new RegExp(`{\\s*action:\\s*'${actionValue}'\\s*(,\\s*[^}]*?)?}`, 'm');

    let updatedRoutesContent = routesContent;
    if (routeRegex.test(routesContent)) {
        // If a matching route is found, update its swagger field
        updatedRoutesContent = routesContent.replace(routeRegex, (match) => {
            if (match.includes('swagger:')) {
                // Update existing swagger reference
                return match.replace(/swagger:\\s*'[^']*'/, `swagger: ${swaggerVariable}`);
            } else {
                // Add swagger reference if it does not exist
                return match.replace(/}\s*$/, `, swagger: swaggerDocs?.${swaggerVariable} }`);
            }
        });
    } else {
        // If no matching route is found, add a new route object
        const routeToAdd = `{\n    action: '${actionValue}',\n    swagger: ${swaggerVariable}\n}`;
        updatedRoutesContent = updatedRoutesContent.replace(/];$/, `,${routeToAdd}\n];`);
    }

    try {
        fs.writeFileSync(routesPath, updatedRoutesContent, 'utf8');
    } catch (err) {
        console.error('Error updating routes.js:', err);
    }
};

// Run the function
createSwaggerIndexFile();

/**
 * Ensure that the require statement for swaggerDocs is present in the target file.
 * 
 * @param {string} targetFilePath - The path to the file where the require statement should be added.
 * @param {string} swaggerDocsFilePath - The path to the swagger docs file to require.
 */
function ensureSwaggerDocsRequire(targetFilePath, swaggerDocsFilePath) {
    const swaggerDocsPath = path.resolve(__dirname, swaggerDocsFilePath);
    const absoluteTargetFilePath = path.resolve(__dirname, targetFilePath);
    const requireLine = `const swaggerDocs = require('${swaggerDocsFilePath}');\n`;

    // Check if the swagger docs file exists
    fs.access(swaggerDocsPath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error(`File does not exist at ${swaggerDocsPath}. Please ensure the file is created.`);
            return;
        }

        // Read the target file content
        fs.readFile(absoluteTargetFilePath, 'utf8', (readErr, data) => {
            if (readErr) {
                console.error(`Error reading the file ${absoluteTargetFilePath}: ${readErr.message}`);
                return;
            }

            // Check if the swaggerDocs variable is already declared
            const variableRegex = /const\s+swaggerDocs\s+=\s+require\(['"`][^'"]+['"`]\)/;
            const isAlreadyDeclared = variableRegex.test(data);

            if (isAlreadyDeclared) {
                // console.log(`'swaggerDocs' variable is already declared in ${absoluteTargetFilePath}. No changes needed.`);
            } else {
                // console.log(`'swaggerDocs' variable is not declared. Adding require statement.`);

                // Add require line to the top of the target file
                fs.writeFile(absoluteTargetFilePath, requireLine + data, 'utf8', (writeErr) => {
                    if (writeErr) {
                        console.error(`Error writing to the file ${absoluteTargetFilePath}: ${writeErr.message}`);
                        return;
                    }
                    // console.log(`Require line for swagger docs added to ${absoluteTargetFilePath}`);
                });
            }
        });
    });
}



// Base directory for controller files
const baseDir = path.join(__dirname, '../../api/controllers');

// Function to get the relative path from the base directory
const getRelativePath = (filePath) => {
    const relativePath = path.relative(baseDir, filePath);
    const fileNameWithoutExt = path.parse(relativePath).name;
    const dirName = path.dirname(relativePath);
    const relativePathWithDir = path.join(dirName, fileNameWithoutExt);
    return relativePathWithDir.replace(/\\/g, '/');
};

// Function to check if an export already exists in index.js
const checkIfExportExists = (variableName) => {
    try {
        const indexContent = fs.readFileSync(swaggerIndex, 'utf8');
        const exportStatement = `const ${variableName} = require('./`;
        return indexContent.includes(exportStatement);
    } catch (err) {
        console.error('Error reading index.js:', err);
        return false;
    }
};

// Function to generate a JSON file and update swagger/docs/index.js dynamically
const generateJsonFile = (data) => {
    const { key, Tags, Description, required_data, response } = data;

    const parts = key.split('/');
    const folderName = parts[1] || 'default';
    const fileName = `${parts[2] || 'list'}.json`;
    const folderPath = path.join(__dirname, '../../swagger/docs', folderName);

    if (!fs.existsSync(folderPath)) {
        try {
            fs.mkdirSync(folderPath, { recursive: true });
        } catch (err) {
            console.error('Error creating folder:', err);
            return;
        }
    }

    const metaProperties = response.meta ? Object.keys(response.meta).reduce((acc, key) => {
        acc[key] = {
            "description": `${key.charAt(0).toUpperCase() + key.slice(1)} of the meta data.`,
            "type": typeof response.meta[key],
            "example": response.meta[key]
        };
        return acc;
    }, {}) : {};

    const itemProperties = response.items && response.items.length > 0 ? Object.keys(response.items[0]).reduce((acc, key) => {
        acc[key] = {
            "description": `${key.charAt(0).toUpperCase() + key.slice(1)} of the item.`,
            "type": typeof response.items[0][key],
            "example": response.items[0][key]
        };
        return acc;
    }, {}) : {};

    let requiredDataSchema = {};

    const dataForSwagger = {
        "thumbnail": null,
        // "created_at": "2024-10-15T10:58:11.828Z",
        // "updated_at": "2024-10-15T10:58:11.828Z",
        // "id": "486",
        "full_name": "Test Account ",
        "type": 1,
        "media": '',
        "video": '',
        "description": "Capture the wild beauty of nature at Guindy National Park.",
        "phone": "",
        "min_seats": 5,
        "max_seats": 5,
        // "booked_seats": 0,
        // "booked": 0,
        // "bookmarks": 0,
        // "followers": 0,
        "title": "Prd APi 003",
        "price": 99,
        "tags": "Business",
        // "address": "Peelamedu, Coimbatore",
        // "city": "Pappireddipatti",
        "event_date": "2024-10-04T00:30:00.000Z",
        "reviews": 0,
        "status": 3,
        "admin_id": 0,
        "user_type": 2,
        "location": {
            "lat": 11.0168,
            "lng": 76.9558
        },
        // "event_done_flag": false,
        // "state": "Tamil Nadu",
        // "district": "Coimbatore",
        // "pincode": "636905",
        "table_expense": 1,
        // "format_geo_address": "Venkitapuram, Seth Narang Das Layout, Kallathukadu, Pappireddipatti, Coimbatore, Tamil Nadu, India",
        "category": "35",
        // "created_by": 1030,
        // "user_profile": 1030
    }

    if (Array.isArray(required_data) && required_data.length > 0) {

        requiredDataSchema = required_data.reduce((schema, attr) => {
            const { name, number, min } = attr;
            const example = dataForSwagger[name] !== undefined ? dataForSwagger[name] : (number ? (min || 1) : "example");

            // Get the type dynamically from dataForSwagger if it exists
            // const type = typeof dataForSwagger[name] === "number" ? "integer" : "string";
            if (dataForSwagger[name]) {
                schema[name] = {
                    description: `${name.charAt(0).toUpperCase() + name.slice(1)} of the request.`,
                    type: typeof dataForSwagger[name],
                    example: example,
                    minimum: min || undefined,
                };
            }
            return schema;
        }, {});
    }
    // Handle details key
    const detailsProperties = response.details ? Object.keys(response.details).reduce((acc, key) => {
        acc[key] = {
            "description": `${key.charAt(0).toUpperCase() + key.slice(1)} of the details.`,
            "type": typeof response.details[key],
            "example": response.details[key]
        };
        return acc;
    }, {}) : {};

    const responseSchema = {
        "message": {
            "description": "Success message.",
            "type": "string",
            "example": response.message || "Operation completed successfully."
        },
    };

    // Only include `meta` if it exists
    if (Object.keys(metaProperties).length > 0) {
        responseSchema["meta"] = {
            "type": "object",
            "properties": metaProperties
        };
    }

    // Only include `items` if it exists
    // console.log('itemProperties',itemProperties)
    if (Object.keys(itemProperties).length > 0) {
        responseSchema["items"] = {
            "type": "array",
            "items": {
                "type": "object",
                "properties": itemProperties
            }
        };
    }

    // Include `details` if it exists
    if (Object.keys(detailsProperties).length > 0) {
        responseSchema["details"] = {
            "type": "object",
            "properties": detailsProperties
        };
    }

    const responses = {
        "200": {
            "description": response.message || "Request completed successfully.",
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object",
                        "properties": responseSchema
                    }
                }
            }
        },
        "400": {
            "description": "Bad request",
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "message": {
                                "description": "Error message.",
                                "type": "string",
                                "example": "Bad request"
                            },
                        }
                    }
                }
            }
        },
        "401": {
            "description": "Unauthorized",
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "message": {
                                "description": "Error message.",
                                "type": "string",
                                "example": "Unauthorized"
                            },
                        }
                    }
                }
            }
        },
        "403": {
            "description": "Forbidden",
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "message": {
                                "description": "Error message.",
                                "type": "string",
                                "example": "You don't have permission to perform this action"
                            },
                        }
                    }
                }
            }
        },
        "404": {
            "description": "Not found",
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "message": {
                                "description": "Error message.",
                                "type": "string",
                                "example": "Resource not found"
                            },
                        }
                    }
                }
            }
        },
        "500": {
            "description": "Internal server error",
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "message": {
                                "description": "Error message.",
                                "type": "string",
                                "example": "Internal server error"
                            },
                        }
                    }
                }
            }
        },
    };

    const jsonStructure = {
        [key]: {
            "tags": [Tags],
            "summary": Description,
            "description": `Use this API to ${Description.toLowerCase()}.`,
            "operationId": `${key.replace(/^\/+/, '')}`,
            "requestBody": {
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                            "properties": requiredDataSchema,
                            "required": Object.keys(required_data)
                        }
                    }
                }
            },
            "responses": responses
        }
    };

    // Write the JSON structure to a file
    const filePath = path.join(folderPath, fileName);


    // Function to update or add a route with Swagger reference


    try {
        fs.writeFileSync(filePath, JSON.stringify(jsonStructure, null, 2), 'utf8');
    } catch (err) {
        console.error('Error writing file:', err);
    }

    // Dynamically update swagger/docs/index.js
    const variableName = `${folderName}${fileName.replace('.json', '').replace(/[^a-zA-Z0-9]/g, '')}`;
    const variableName2 = `${variableName.replace(/[^a-zA-Z0-9]/g, '')}Swagger`;
    const requireStatement = `const ${variableName} = require('./${folderName}/${fileName}');\n`;
    // console.log("variableName :-",variableName, "variableName2 :-",variableName2, "requireStatement :-",requireStatement)

    // Check if the export already exists
    if (!checkIfExportExists(variableName)) {
        // Read the current swagger/docs/index.js content
        let indexContent = fs.readFileSync(swaggerIndex, 'utf8');

        // Add the new require statement if it does not exist
        if (!indexContent.includes(requireStatement)) {
            indexContent = requireStatement + indexContent;
        }

        // Add the Swagger specific assignment if it does not exist
        const swaggerRequireStatement = `const ${variableName2} = ${variableName}['${key}'];\n`;
        if (!indexContent.includes(swaggerRequireStatement)) {
            indexContent = indexContent.replace(requireStatement, requireStatement + swaggerRequireStatement);
        }

        // Update the module.exports line
        const moduleExportsLine = `module.exports = {\n    ${variableName2},`;
        if (!indexContent.includes(moduleExportsLine)) {
            indexContent = indexContent.replace('module.exports = {', moduleExportsLine);
        }

        // Add the closing bracket if necessary
        if (!indexContent.includes('};')) {
            indexContent = indexContent.replace(/module.exports = {/, match => match + '\n};');
        }

        // Update the swaggerRefs array dynamically
        const swaggerRefsStatement = `swaggerRefs.push({ key: '${key}', refs: '${variableName2}' });\n`;
        swaggerRefs.forEach(async swaggerRef => {
            await updateRouteWithSwaggerReference(swaggerRef.key, swaggerRef.refs);
        });
        if (!indexContent.includes(swaggerRefsStatement)) {
            const refsIndex = indexContent.indexOf('swaggerRefs = [');
            const sanitizedKey = key.startsWith('/') ? key.slice(1) : key;
            if (refsIndex !== -1) {
                const refsEndIndex = indexContent.indexOf('];', refsIndex);
                const currentRefs = indexContent.slice(refsIndex + 'swaggerRefs = ['.length, refsEndIndex).trim().split('\n').map(line => line.trim());
                if (!currentRefs.some(line => line.includes(`key: '${sanitizedKey}'`))) {
                    indexContent = indexContent.slice(0, refsEndIndex) + `    { key: '${sanitizedKey}', refs: '${variableName2}' },\n` + indexContent.slice(refsEndIndex);
                }
            } else {
                const refsDeclaration = `const swaggerRefs = [\n    { key: '${sanitizedKey}', refs: '${variableName2}' },\n];\n`;
                indexContent = indexContent.replace(requireStatement, requireStatement + refsDeclaration);
            }
        }

        // Write the updated content back to swagger/docs/index.js
        fs.writeFileSync(swaggerIndex, indexContent, 'utf8');
    } else {
        // console.log(`Export for ${variableName} already exists in ${swaggerIndex}.`);
    }
};


// Ensure all asynchronous operations are complete
const updateAllRoutes = async () => {
    await Promise.all(swaggerRefs.map(swaggerRef => updateRouteWithSwaggerReference(swaggerRef.key, swaggerRef.refs)));
};

updateAllRoutes().then(() => {
    // Create swagger index file and generate JSON files
    createSwaggerIndexFile();

    // Example data to generate JSON files
    const apiData = [
        {
            key: 'user/get',
            Tags: 'User',
            Description: 'Get user details',
            body: {},
            params: {},
            required_data: {},
            response: {
                message: 'User details fetched successfully',
                meta: {},
                items: [{}]
            }
        }
    ];

    // Generate JSON files and update swagger/docs/index.js and routes.js
    apiData.forEach(generateJsonFile);
});

createSwaggerIndexFile();

module.exports = {
    getRelativePath,
    generateJsonFile
};

// Example data to generate JSON files
const apiData = [
    {
        key: 'user/get',
        Tags: 'User',
        Description: 'Get user details',
        body: {},
        params: {},
        required_data: {},
        response: {
            message: 'User details fetched successfully',
            meta: {},
            items: [{}]
        }
    }
];

// Create swagger/docs/index.js if it doesn't exist
createSwaggerIndexFile();

// Generate JSON files and update swagger/docs/index.js and routes.js
apiData.forEach(generateJsonFile);

