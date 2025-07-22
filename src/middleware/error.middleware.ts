import { Request, Response, NextFunction } from "express";
import { CustomError } from "../types/error-middleware.types";

export function errorHandler(
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).send({
    success: false,
    message,
    timestamp: new Date().toISOString(),
  });
}
