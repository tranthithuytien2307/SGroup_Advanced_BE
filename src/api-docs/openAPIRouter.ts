import { Express } from "express";
import swaggerUi from "swagger-ui-express";
import { openAPIDocument } from "./openAPIDocumentGenerator";

const swaggerDoc = {
  ...openAPIDocument,
  paths: {
    // --- USER ROUTES ---
    "/api/users": {
      get: {
        summary: "Get all users",
        tags: ["Users"],
        security: [{ BearerAuth: [] }], 
        responses: {
          "200": {
            description: "List of users",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/User" },
                },
              },
            },
          },
        },
      },
    },
    "/api/user/{id}": {
      get: {
        summary: "Get user by ID",
        tags: ["Users"],
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": {
            description: "User found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
          "404": { description: "User not found" },
        },
      },
      put: {
        summary: "Update user by ID",
        tags: ["Users"],
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserInput" },
            },
          },
        },
        responses: {
          "200": {
            description: "User updated successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
          "404": { description: "User not found" },
        },
      },
      delete: {
        summary: "Delete user by ID",
        tags: ["Users"],
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "204": { description: "User deleted successfully" },
          "404": { description: "User not found" },
        },
      },
    },
    "/api/user/profile": {
      patch: {
        summary: "Update current user profile",
        tags: ["Users"],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserProfileInput" },
            },
          },
        },
        responses: {
          "200": {
            description: "Profile updated successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
        },
      },
    },
    "/api/avatar": {
      patch: {
        summary: "Upload user avatar",
        tags: ["Users"],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: { avatar: { type: "string", format: "binary" } },
              },
            },
          },
        },
        responses: { "200": { description: "Avatar uploaded successfully" } },
      },
    },

    // --- AUTH ROUTES ---
    "/api/auth/login": {
      post: {
        summary: "Login user",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginInput" },
            },
          },
        },
        responses: {
          "200": {
            description: "User logged in",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "400": { description: "Invalid credentials" },
        },
      },
    },
    "/api/auth/google/login": {
      post: {
        summary: "Login with Google",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginWithGoogleInput" },
            },
          },
        },
        responses: {
          "200": {
            description: "User logged in via Google",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
        },
      },
    },
    "/api/auth/register": {
      post: {
        summary: "Register new user",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterInput" },
            },
          },
        },
        responses: {
          "201": {
            description: "User registered successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
        },
      },
    },
    "/api/auth/verify-email": {
      get: {
        summary: "Verify email",
        tags: ["Auth"],
        parameters: [
          {
            name: "email",
            in: "query",
            required: true,
            schema: { type: "string", format: "email" },
          },
          {
            name: "code",
            in: "query",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Email verified successfully" },
          "400": { description: "Invalid code" },
        },
      },
    },
    "/api/auth/refresh": {
      post: {
        summary: "Refresh token",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RefreshTokenInput" },
            },
          },
        },
        responses: {
          "200": {
            description: "Token refreshed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
        },
      },
    },
    "/api/auth/forgot-password": {
      post: {
        summary: "Forgot password",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ForgotPasswordInput" },
            },
          },
        },
        responses: { "200": { description: "Reset email sent" } },
      },
    },
    "/api/auth/reset-password": {
      post: {
        summary: "Reset password",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ResetPasswordInput" },
            },
          },
        },
        responses: { "200": { description: "Password reset successfully" } },
      },
    },
    "/api/auth/resend-code": {
      post: {
        summary: "Resend verification code",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ResendVerificationCodeInput",
              },
            },
          },
        },
        responses: { "200": { description: "Code resent successfully" } },
      },
    },

    // --- WORKSPACE ROUTES ---
    "/api/workspace": {
      post: {
        summary: "Create new workspace",
        tags: ["Workspace"],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/WorkspaceInput" },
            },
          },
        },
        responses: {
          "201": {
            description: "Workspace created successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Workspace" },
              },
            },
          },
        },
      },
      get: {
        summary: "Get all workspaces",
        tags: ["Workspace"],
        security: [{ BearerAuth: [] }],
        responses: {
          "200": {
            description: "List of workspaces",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Workspace" },
                },
              },
            },
          },
        },
      },
    },
    "/api/workspace/{id}": {
      get: {
        summary: "Get workspace by ID",
        tags: ["Workspace"],
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": {
            description: "Workspace found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Workspace" },
              },
            },
          },
        },
      },
      put: {
        summary: "Update workspace",
        tags: ["Workspace"],
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/WorkspaceInput" },
            },
          },
        },
        responses: {
          "200": {
            description: "Workspace updated successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Workspace" },
              },
            },
          },
        },
      },
      delete: {
        summary: "Delete workspace",
        tags: ["Workspace"],
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { "204": { description: "Workspace deleted successfully" } },
      },
    },

    // --- HEALTH CHECK ---
    "/api/health": {
      get: {
        summary: "Health check",
        tags: ["Health"],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { status: { type: "string", example: "ok" } },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    ...openAPIDocument.components,
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};

export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));
};
