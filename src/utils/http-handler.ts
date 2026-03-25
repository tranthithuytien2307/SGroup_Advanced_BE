import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodSchema, ZodError } from "zod";
import { ResponseStatus, ServiceResponse } from "../provides/service.response";

// Format and send service response
export const handleServiceResponse = (
  serviceResponse: ServiceResponse<any>,
  response: Response,
) => {
  return response.status(serviceResponse.statusCode).send(serviceResponse);
};

type RequestPart = "body" | "query" | "params";

export const validateRequest = (
  schema: ZodSchema,
  part: RequestPart = "body",
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

      // chỉ overwrite body
      if (part === "body") {
        req.body = parsedData;
      }

      // attach validated data
      (req as any).validated = {
        ...(req as any).validated,
        [part]: parsedData,
      };

      next();
    } catch (err) {
      // chỉ handle ZodError
      if (err instanceof ZodError) {
        const errorMessage = err.issues.map((e) => e.message).join(", ");

        return res
          .status(StatusCodes.BAD_REQUEST)
          .send(
            new ServiceResponse<null>(
              ResponseStatus.Failed,
              `Invalid input: ${errorMessage}`,
              null,
              StatusCodes.BAD_REQUEST,
            ),
          );
      }

      next(err);
    }
  };
};
