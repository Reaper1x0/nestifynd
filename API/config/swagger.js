const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NestifyND API',
      version: '1.0.0',
      description: 'Backend API for NestifyND - Routine Builder Application',
      contact: {
        name: 'NestifyND Team',
        email: 'support@nestifynd.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://api.nestifynd.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            _id: {
              type: 'string',
              description: 'User ID'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'User password'
            },
            name: {
              type: 'string',
              description: 'User full name'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin', 'therapist'],
              description: 'User role'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp'
            }
          }
        },
        Task: {
          type: 'object',
          required: ['title', 'description'],
          properties: {
            _id: {
              type: 'string',
              description: 'Task ID'
            },
            title: {
              type: 'string',
              description: 'Task title'
            },
            description: {
              type: 'string',
              description: 'Task description'
            },
            completed: {
              type: 'boolean',
              description: 'Task completion status'
            },
            dueDate: {
              type: 'string',
              format: 'date-time',
              description: 'Task due date'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              description: 'Task priority level'
            },
            userId: {
              type: 'string',
              description: 'ID of the user who owns this task'
            }
          }
        },
        Routine: {
          type: 'object',
          required: ['name', 'description'],
          properties: {
            _id: {
              type: 'string',
              description: 'Routine ID'
            },
            name: {
              type: 'string',
              description: 'Routine name'
            },
            description: {
              type: 'string',
              description: 'Routine description'
            },
            isActive: {
              type: 'boolean',
              description: 'Whether the routine is currently active'
            },
            tasks: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Array of task IDs in this routine'
            },
            userId: {
              type: 'string',
              description: 'ID of the user who owns this routine'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message'
            },
            status: {
              type: 'integer',
              description: 'HTTP status code'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './controllers/*.js']
};

const specs = swaggerJSDoc(options);

module.exports = {
  swaggerUi,
  specs
};




