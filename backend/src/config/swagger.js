const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Stage Manager API',
      version: '1.0.0',
      description: 'API de gestion des stages universitaires',
    },
    servers: [{ url: `http://localhost:${process.env.PORT || 3000}/api` }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./src/routes/*.js', './src/models/*.js'],
};

module.exports = swaggerJsdoc(options);
