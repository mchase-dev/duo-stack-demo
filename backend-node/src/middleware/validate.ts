import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Input Validation Middleware
 * Validates request body against a Zod schema
 */

/**
 * Validate request body against a Zod schema
 * @param schema - Zod schema to validate against
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate and transform request body against schema
      req.body = schema.parse(req.body);

      // Validation passed, proceed to next middleware
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod validation errors
        const formattedErrors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          error: 'Validation failed',
          details: formattedErrors,
        });
        return;
      }

      // Unexpected error
      res.status(400).json({
        error: 'Validation failed',
        message: error instanceof Error ? error.message : 'Unknown validation error',
      });
    }
  };
}

/**
 * Validate request query parameters against a Zod schema
 * @param schema - Zod schema to validate against
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate and transform query parameters against schema
      req.query = schema.parse(req.query) as any;

      // Validation passed, proceed to next middleware
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod validation errors
        const formattedErrors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          error: 'Query validation failed',
          details: formattedErrors,
        });
        return;
      }

      // Unexpected error
      res.status(400).json({
        error: 'Query validation failed',
        message: error instanceof Error ? error.message : 'Unknown validation error',
      });
    }
  };
}

/**
 * Validate request params against a Zod schema
 * @param schema - Zod schema to validate against
 */
export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate and transform params against schema
      req.params = schema.parse(req.params) as any;

      // Validation passed, proceed to next middleware
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod validation errors
        const formattedErrors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          error: 'Parameter validation failed',
          details: formattedErrors,
        });
        return;
      }

      // Unexpected error
      res.status(400).json({
        error: 'Parameter validation failed',
        message: error instanceof Error ? error.message : 'Unknown validation error',
      });
    }
  };
}
