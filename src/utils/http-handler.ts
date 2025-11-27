// import { NextFunction, Request, Response } from 'express';
// import { StatusCodes } from 'http-status-codes';
// import { ZodError, ZodSchema } from 'zod';

// import { ResponseStatus, ServiceResponse } from '../provides/service.response';

// // Format and send service response
// export const handleServiceResponse = (serviceResponse: ServiceResponse<any>, response: Response) => {
//   return response.status(serviceResponse.statusCode).send(serviceResponse);
// };

// // Middleware to validate request using Zod schema
// export const validateRequest = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
//   try {
//     schema.parse({ body: req.body, query: req.query, params: req.params });
//     next();
//   } catch (err) {
//     const errorMessage = `Invalid input: ${(err as ZodError).issues.map((e) => e.message).join(', ')}`;
//     const statusCode = StatusCodes.BAD_REQUEST;
//     res.status(statusCode).send(new ServiceResponse<null>(ResponseStatus.Failed, errorMessage, null, statusCode));
//   }
// };

import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodSchema, ZodError } from "zod";
import { ResponseStatus, ServiceResponse } from "../provides/service.response";

// Format and send service response
export const handleServiceResponse = (
  serviceResponse: ServiceResponse<any>,
  response: Response
) => {
  return response.status(serviceResponse.statusCode).send(serviceResponse);
};

// Kiểu xác định nơi validate
type RequestPart = "body" | "query" | "params";

/**
 * Middleware validate request
 * @param schema Zod schema
 * @param part "body" | "query" | "params"
 */
export const validateRequest = (
  schema: ZodSchema,
  part: RequestPart = "body"
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      let dataToValidate: any;
      switch (part) {
        case "body":
          dataToValidate = req.body;
          break;
        case "query":
          dataToValidate = req.query;
          break;
        case "params":
          dataToValidate = req.params;
          break;
      }

      const parsedData = schema.parse(dataToValidate);

      // Gán lại dữ liệu đã parse với ép kiểu
      switch (part) {
        case "body":
          req.body = parsedData;
          break;
        case "query":
          req.query = parsedData as any; // <- ép kiểu để TypeScript chấp nhận
          break;
        case "params":
          req.params = parsedData as any; // <- ép kiểu để TypeScript chấp nhận
          break;
      }

      next();
    } catch (err) {
      const errorMessage = `Invalid input: ${(err as ZodError).issues
        .map((e) => e.message)
        .join(", ")}`;

      res
        .status(StatusCodes.BAD_REQUEST)
        .send(
          new ServiceResponse<null>(
            ResponseStatus.Failed,
            errorMessage,
            null,
            StatusCodes.BAD_REQUEST
          )
        );
    }
  };
};
