const fs = require('fs');
const path = require('path');

// Define paths
const swaggerIndex = path.join(__dirname, '../../swagger/docs', 'index.js');
const routesPath = path.join(__dirname, '../../config/routes.js');
// Function to create the swagger/docs/index.js file if it doesn't exist
const createSwaggerIndexFile = () => {
    if (!fs.existsSync(swaggerIndex)) {
        const content = `
let swaggerRefs = [];
module.exports = {
    swaggerRefs,
};\n`;
        try {
            fs.writeFileSync(swaggerIndex, content, 'utf8');
            console.log(`File created: ${swaggerIndex}`);
        } catch (err) {
            console.error('Error creating file:', err);
        }
    } else {
        console.log('swagger/docs/index.js already exists.');
    }
};

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
    const { key, Tags, Description, body, params, required_data, response } = data;

    console.log("key", key);
    const parts = key.split('/');
    const folderName = parts[1] || 'default';
    const fileName = `${parts[2] || 'list'}.json`;
    const folderPath = path.join(__dirname, '../../swagger/docs', folderName);

    // Ensure the folder exists
    if (!fs.existsSync(folderPath)) {
        try {
            fs.mkdirSync(folderPath, { recursive: true });
        } catch (err) {
            console.error('Error creating folder:', err);
            return;
        }
    }

    // Create the JSON structure for the Swagger documentation
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

    const responses = {
        "200": {
            "description": response.message || "Request completed successfully.",
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "message": {
                                "description": "Success message.",
                                "type": "string",
                                "example": response.message || "Operation completed successfully."
                            },
                            "meta": {
                                "type": "object",
                                "properties": metaProperties
                            },
                            "items": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": itemProperties
                                }
                            }
                        }
                    }
                }
            }
        },
        "400": { "description": "Bad request" },
        "401": { "description": "Unauthorized" },
        "403": { "description": "You don't have permission to perform this action" },
        "500": { "description": "Internal server error" }
    };

    const jsonStructure = {
        [key]: {
            "tags": [Tags],
            "summary": Description,
            "description": `Use this API to ${Description.toLowerCase()}.`,
            "operationId": `${folderName}List`,
            "requestBody": {
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                            "properties": {
                                ...Object.fromEntries(Object.entries(required_data).map(([key, value]) => [
                                    key,
                                    {
                                        "description": `${key.charAt(0).toUpperCase() + key.slice(1)} of the request.`,
                                        "type": value.type || "string",
                                        "example": value.example
                                    }
                                ]))
                            },
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

    try {
        fs.writeFileSync(filePath, JSON.stringify(jsonStructure, null, 2), 'utf8');
    } catch (err) {
        console.error('Error writing file:', err);
    }

    // Dynamically update swagger/docs/index.js
    const variableName = `${folderName}${fileName.replace('.json', '')}`;
    const variableName2 = `${variableName}Swagger`;
    const requireStatement = `const ${variableName} = require('./${folderName}/${fileName}');\n`;

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
        console.log(`Updated swagger/docs/index.js with ${variableName} and ${variableName2}`);
    } else {
        console.log(`Export for ${variableName} already exists in ${swaggerIndex}.`);
    }
    const { swaggerRefs } = require('../../swagger/docs');

    // Update routes.js to include the swagger reference
    swaggerRefs.forEach(swaggerRef => {
        updateRouteWithSwaggerReference(swaggerRef.key, swaggerRef.refs);
    });
};

// Function to update or add a route with Swagger reference
const updateRouteWithSwaggerReference = (actionValue, swaggerVariable) => {
    let routesContent;
    try {
        routesContent = fs.readFileSync(routesPath, 'utf8');
    } catch (err) {
        console.error('Error reading routes.js:', err);
        return;
    }

    // Define a regex to match the route object with the specified action
    const actionPath = `action: '${actionValue}'`;
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
        console.log(`Updated routes.js with Swagger reference for action: ${actionValue}`);
    } catch (err) {
        console.error('Error updating routes.js:', err);
    }
};
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
