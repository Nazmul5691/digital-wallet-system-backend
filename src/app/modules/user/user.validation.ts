
import z from "zod";

export const RoleEnum = z.enum(["SUPER_ADMIN", "ADMIN", "USER", "AGENT"]);

export const createUserZodSchema = z.object({
    name: z
        .string({ message: "Name must be string" }) 
        .min(2, { message: "Name too short. Minimum two character long." })
        .max(50, { message: "Name too  long." }),

    email: z
        .string({ message: "Email must be string" })
        .email({ message: "Invalid Email address format" })
        .min(5, { message: "Email must beat least 5 characters long" })
        .max(100, { message: "Email cannot exceed 100 characters" }),

    password: z
        .string({ message: "Password must be string" })
        .min(8, { message: "Password must be 8 character long" })
        .regex(/[A-Z]/, { message: "Password must include at least one uppercase letter" })
        .regex(/\d/, { message: "Password must include at least one digit" })
        .regex(/[!@#$%^&*]/, { message: "Password must include at least one special character" }),

    // phone: z
    //     .string({ message: "Phone number must be string" })
    //     .regex(/^(?:\+8801|01)[0-9]{9}$/, {
    //         message: "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX"
    //     })
    //     .optional(),

    address: z
        .string({ message: "Address must be string" })
        .max(200, { message: "Address cannot exceed 100 characters" })
        .optional(),

    picture: z
        .string({ message: "Picture must be a string" })
        .url({ message: "Picture must be a valid URL" })
        .optional(),

    role: RoleEnum.default("USER"),

    isVerified: z.boolean().optional(),

    isApproved: z.boolean().optional(),

    commissionRate: z.number().nonnegative().optional(),

    walletId: z.string().optional(),
})