import swaggerJsdoc from "swagger-jsdoc";
import { readFileSync } from "fs";
import { resolve } from "path";
import { allPaths } from "../doc/paths";
import { allSchemas } from "../doc/schemas";

const packageJson = JSON.parse(
  readFileSync(resolve(__dirname, "../../package.json"), "utf-8"),
);

/**
 * Swagger/OpenAPI Configuration
 *
 * Uses JSON-based path and schema definitions.
 */
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Docuset API Documentation",
      version: packageJson.version,
      description: `
## Docuset API
AI Document Management System
      `.trim(),
      contact: {
        name: "API Support",
        email: "irochibuzor@gmail.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api/v1`,
        description: "Local",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT Authorization header using the Bearer scheme",
        },
        basicAuth: {
          type: "http",
          scheme: "basic",
          description:
            "HTTP Basic Auth used by the external provider. Credentials: base64(PROVIDER_USERNAME:PROVIDER_SECRET)",
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
      schemas: allSchemas,
    },
    paths: allPaths,
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
