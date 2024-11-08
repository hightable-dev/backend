// config/swagger.js
module.exports.swagger = {
    /**
     * Swagger information. 
     * Should be a valid Swagger definition object.
     * This object will be merged with the default configuration.
     */
    swagger: {
      swagger: '2.0',
      info: {
        title: 'Sails.js API',
        description: 'Sails.js API documentation',
        termsOfService: 'http://example.com/terms/',
        contact: {
          name: 'API Support',
          url: 'http://www.example.com/support',
          email: 'support@example.com'
        },
        license: {
          name: 'Apache 2.0',
          url: 'http://www.apache.org/licenses/LICENSE-2.0.html'
        },
        version: '1.0.0'
      },
      host: 'localhost:1337',
      basePath: '/',
      schemes: [
        'http',
        'https'
      ],
      consumes: [
        'application/json'
      ],
      produces: [
        'application/json'
      ],
    },
  
    /**
     * Whether to expose the documentation at `/swagger` or `/swagger-ui`.
     * Can be disabled in production.
     */
    route: {
      url: '/swagger',
      docs: '/swagger.json' // You can customize the path for the generated Swagger doc.
    },
  
    /**
     * When to generate the Swagger JSON.
     * Should be set to true in development mode and false in production.
     */
    generate: true,
  
    /**
     * Specifies the paths to include in the generated Swagger JSON.
     * You can use wildcard patterns to include/exclude certain files or directories.
     */
    pathsToIgnore: ['/node_modules', '/test', '/swagger-ui']
  };
  