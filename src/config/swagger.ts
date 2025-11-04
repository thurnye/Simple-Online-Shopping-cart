import swaggerJsdoc from "swagger-jsdoc";

export const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Telecom Cart API",
      version: "1.0.0",
      description:
        "API for managing telecom shopping carts on top of a Salesforce-like context. Built with Node.js, TypeScript, and Express.",
      contact: {
        name: "Bell Canada Tech Challenge",
        email: "team@bell.ca",
      },
    },
    servers: [
      {
        url: "http://localhost:3000/api",
        description: "Local development server",
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
