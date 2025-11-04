import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Telecom Cart API',
    description: 'Automatically generated API documentation for the Telecom Cart backend',
    version: '1.0.0',
  },
  servers: [
    { url: 'http://localhost:3000/api', description: 'Local server' },
  ],
  components: {},
};

const outputFile = './src/config/swagger-output.json';
const endpointsFiles = ['./src/routes/cart.routes.ts'];

const swaggerGen = swaggerAutogen({ openapi: '3.0.0' });
swaggerGen(outputFile, endpointsFiles, doc);
