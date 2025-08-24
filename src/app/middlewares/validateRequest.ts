// import { NextFunction, Request, Response } from "express";
// import { AnyZodObject } from "zod";

// export const validateRequest = (zodSchema: AnyZodObject) => async (req: Request, res: Response, next: NextFunction) => {

//     try {
//         // req.body = JSON.parse(req.body.data || {}) || req.body;
//         if(req.body.data){
//             req.body = JSON.parse(req.body.data)
//         }
//         req.body = await zodSchema.parseAsync(req.body);
//         next();

//     } catch (error) {
//         next(error)
//     }
// }


// import { NextFunction, Request, Response } from "express";
// import { AnyZodObject } from "zod";
// import AppError from "../errorHelpers/appError";

// export const validateRequest = (zodSchema: AnyZodObject) => async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     // If `req.body.data` exists (from some clients), parse it
//     const bodyToValidate = req.body.data ? JSON.parse(req.body.data) : req.body;

//     // Validate with zod
//     req.body = await zodSchema.parseAsync(bodyToValidate);

//     next();
//   } catch (error: any) {
//     // Wrap zod errors in a friendly message
//     next(new AppError(400, error.errors?.[0]?.message || "Invalid request data"));
//   }
// };


// src/app/middlewares/validateRequest.ts
import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";

export const validateRequest = (zodSchema: AnyZodObject) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bodyToValidate = req.body.data ? JSON.parse(req.body.data) : req.body;

    // Validate body
    req.body = await zodSchema.parseAsync(bodyToValidate);

    next();
  } catch (error: any) {
    // Return all Zod validation errors
    if (error?.errors) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.errors,
      });
    }
    next(error);
  }
};

