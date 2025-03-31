import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Reservas de Salas',
      version: '1.0.0',
      description: 'API para gestionar reservas de salas de reuniones',
    },
    servers: [
      {

        url: 'http://localhost:5000',
        description: 'Servidor de desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Rutas donde buscar las anotaciones
};

export const swaggerSpec = swaggerJsdoc(options); 